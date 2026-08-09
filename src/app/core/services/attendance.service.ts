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
  query
} from 'firebase/firestore';

import { firestore } from '../firebase/firebase';

import { Collections } from '../constants/firestore.collections';
import { Attendance } from '../../models/attendance';
import { ClassSession } from '../../models/class-session';
import { Reward } from '../../models/reward';
import { REWARD_CARDS } from '../../shared/data/reward-cards';

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

    const counts: Record<string, number> = {};

    for (const document of snapshot.docs) {

      const attendance =
        document.data() as Attendance;

      if (
        attendance.rewardClaimed &&
        attendance.rewardId
      ) {

        counts[attendance.rewardId] =
          (counts[attendance.rewardId] ?? 0) + 1;

      }

    }

    return counts;

  }

  async register(
    session: ClassSession,
    studentUid: string
  ): Promise<Attendance> {

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