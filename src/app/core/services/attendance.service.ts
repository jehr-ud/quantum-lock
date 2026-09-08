import { Injectable } from '@angular/core';

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  getDocs,
  where,
  collection,
  query,
  onSnapshot
} from 'firebase/firestore';

import { firestore } from '../firebase/firebase';

import { Collections } from '../constants/firestore.collections';
import { Attendance } from '../../models/attendance';
import { ClassSession } from '../../models/class-session';
import { Reward } from '../../models/reward';
import {
  REWARD_CARDS
} from '../../shared/data/reward-cards';
import {
  SessionStatus
} from '../enums/session-status';
import {
  Timestamp
} from 'firebase/firestore';
import {
  AttendanceExportRow,
  StudentInfo,
  StudentReportRow,
  buildExportRows,
  buildStudentReportRows,
  computeRewardCounts,
  countDistinctStudents
} from '../utils/domain';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {


  async getStudentRewardCounts(
    studentUid: string,
    courseId: string
  ): Promise<Record<string, number>> {

    const q = query(

      collection(
        firestore,
        Collections.ATTENDANCES
      ),

      where(
        'studentUid',
        '==',
        studentUid
      ),

      where(
        'courseId',
        '==',
        courseId
      )

    );

    const snapshot =
      await getDocs(q);

    return computeRewardCounts(
      snapshot.docs.map(document =>
        document.data() as Attendance
      )
    );

  }

  /**
   * RQ02 — Observa en tiempo real el número de
   * estudiantes distintos que registraron asistencia
   * en la sesión actual.
   */
  countSessionStudents(
    sessionId: string,
    onResult: (
      count: number
    ) => void,
    onError?: (
      error: unknown
    ) => void
  ): () => void {

    const q = query(

      collection(
        firestore,
        Collections.ATTENDANCES
      ),

      where(
        'sessionId',
        '==',
        sessionId
      )

    );

    return onSnapshot(
      q,
      snapshot => {

        onResult(
          countDistinctStudents(
            snapshot.docs.map(document =>
              document.data() as Attendance
            )
          )
        );

      },
      error => {

        if (onError) {

          onError(error);

        }

      }
    );

  }

  /**
   * RQ08 — Recupera la asistencia del estudiante en el
   * curso seleccionado y la convierte en las filas del
   * reporte por curso (fecha, estado y cartas obtenidas).
   */
  async getStudentCourseReport(
    studentUid: string,
    courseId: string
  ): Promise<StudentReportRow[]> {

    const q = query(

      collection(
        firestore,
        Collections.ATTENDANCES
      ),

      where(
        'studentUid',
        '==',
        studentUid
      ),

      where(
        'courseId',
        '==',
        courseId
      )

    );

    const snapshot =
      await getDocs(q);

    return buildStudentReportRows(
      snapshot.docs.map(document =>
        document.data() as Attendance
      )
    );

  }

  /**
   * RQ05 — Recupera los registros de asistencia del
   * curso seleccionado y los convierte en filas para
   * el reporte de exportación.
   */
  async getCourseAttendance(
    courseId: string
  ): Promise<AttendanceExportRow[]> {

    const attendanceQuery = query(

      collection(
        firestore,
        Collections.ATTENDANCES
      ),

      where(
        'courseId',
        '==',
        courseId
      )

    );

    const attendanceSnapshot =
      await getDocs(attendanceQuery);

    const attendances =
      attendanceSnapshot.docs.map(document =>
        document.data() as Attendance
      );

    const usersById: Record<string, StudentInfo> = {};

    const usersSnapshot =
      await getDocs(
        collection(
          firestore,
          Collections.USERS
        )
      );

    for (const document of usersSnapshot.docs) {

      const data = document.data();

      usersById[document.id] = {
        firstName: data?.['firstName'],
        lastName: data?.['lastName'],
        email: data?.['email']
      };

    }

    return buildExportRows(
      attendances,
      usersById
    );

  }

  /**
   * RQ06 — Garantiza que la participación solo sea
   * válida mientras la sesión está disponible.
   */
  private assertSessionAvailable(
    session: ClassSession
  ): void {

    if (
      session.status !==
      SessionStatus.ACTIVE
    ) {

      throw new Error(
        'SESSION_NOT_ACTIVE'
      );

    }

    if (
      session.expiresAt instanceof Timestamp &&
      session.expiresAt.toMillis() < Date.now()
    ) {

      throw new Error(
        'SESSION_EXPIRED'
      );

    }

  }

  async register(
    session: ClassSession,
    studentUid: string
  ): Promise<Attendance> {

    this.assertSessionAvailable(session);

    const id =
      `${session.id}_${studentUid}`;

    const ref = doc(
      firestore,
      Collections.ATTENDANCES,
      id
    );

    const snapshot =
      await getDoc(ref);

    /*
     * El estudiante ya tiene asistencia
     */
    if (snapshot.exists()) {

      const attendance =
        snapshot.data() as Attendance;

      /*
       * Si ya resolvió anteriormente,
       * no generamos otra recompensa.
       */
      if (attendance.solved) {

        return attendance;

      }

      const reward =
        this.selectRandomReward();

      await updateDoc(ref, {

        solved: true,

        rewardId: reward.id

      });

      return {

        ...attendance,

        solved: true,

        rewardId: reward.id

      };

    }

    /*
     * Primera vez que registra asistencia
     */

    const reward =
      this.selectRandomReward();

    const attendance: Attendance = {

      id,

      sessionId: session.id,

      courseId: session.courseId,

      studentUid,

      registeredAt:
        serverTimestamp(),

      attempts: 1,

      solved: true,

      rewardId: reward.id,

      rewardClaimed: false

    };

    await setDoc(

      ref,

      attendance

    );

    return attendance;

  }

  async registerFailedAttempt(
    session: ClassSession,
    studentUid: string
  ): Promise<void> {

    this.assertSessionAvailable(session);

    const id =
      `${session.id}_${studentUid}`;

    const ref = doc(

      firestore,

      Collections.ATTENDANCES,

      id

    );

    const snapshot =
      await getDoc(ref);

    if (!snapshot.exists()) {

      await setDoc(ref, {

        id,

        sessionId: session.id,

        courseId: session.courseId,

        studentUid,

        registeredAt: serverTimestamp(),

        attempts: 1,

        solved: false,

        rewardClaimed: false

      });

      return;

    }

    const attendance =
      snapshot.data() as Attendance;

    await updateDoc(ref, {

      attempts:
        (attendance.attempts ?? 0) + 1

    });

  }

  async hasAttendance(

    sessionId: string,

    studentUid: string

  ): Promise<boolean> {

    const snapshot = await getDoc(

      doc(

        firestore,

        Collections.ATTENDANCES,

        `${sessionId}_${studentUid}`

      )

    );

    return snapshot.exists();

  }

  async getAttendance(
    sessionId: string,
    studentUid: string
  ): Promise<Attendance | null> {

    const id =
      `${sessionId}_${studentUid}`;

    const ref = doc(

      firestore,

      Collections.ATTENDANCES,

      id

    );

    const snapshot =
      await getDoc(ref);

    if (!snapshot.exists()) {

      return null;

    }

    return snapshot.data() as Attendance;

  }

  async claimReward(
    sessionId: string,
    studentUid: string
  ): Promise<Attendance | null> {

    const id =
      `${sessionId}_${studentUid}`;

    const ref = doc(

      firestore,

      Collections.ATTENDANCES,

      id

    );

    const snapshot =
      await getDoc(ref);

    if (!snapshot.exists()) {

      return null;

    }

    const attendance =
      snapshot.data() as Attendance;

    if (!attendance.solved) {

      return null;

    }

    if (attendance.rewardClaimed) {

      return attendance;

    }

    await updateDoc(ref, {

      rewardClaimed: true

    });

    return {

      ...attendance,

      rewardClaimed: true

    };

  }
  private selectRandomReward() {


    const index = Math.floor(

      Math.random() * REWARD_CARDS.length

    );

    return REWARD_CARDS[index];
  }

  getReward(
    rewardId: string
  ): Reward | null {

    return REWARD_CARDS.find(

      reward => reward.id === rewardId

    ) ?? null;

  }

}