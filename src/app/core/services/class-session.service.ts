import { Injectable, signal } from '@angular/core';

import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';

import { firestore } from '../firebase/firebase';

import { Collections } from '../constants/firestore.collections';

import { ClassSession } from '../../models/class-session';
import { QuantumLock } from '../../models/quantum-lock';
import { QuantumDirection } from '../enums/quantum-direction';

import { SessionStatus } from '../enums/session-status';

@Injectable({
  providedIn: 'root'
})
export class ClassSessionService {
  readonly session = signal<ClassSession | null>(null);
  private readonly directions: QuantumDirection[] = [

    QuantumDirection.N,
    QuantumDirection.NE,
    QuantumDirection.E,
    QuantumDirection.SE,
    QuantumDirection.S,
    QuantumDirection.SW,
    QuantumDirection.W,
    QuantumDirection.NW

  ];

  watchSession(id: string): void {

  const ref = doc(
    firestore,
    Collections.CLASS_SESSIONS,
    id
  );

  onSnapshot(ref, snapshot => {

    if (!snapshot.exists()) {
      return;
    }

    this.session.set(
      snapshot.data() as ClassSession
    );

  });

}

  async createSession(
    courseId: string,
    teacherUid: string,
    duration = 30
  ): Promise<ClassSession> {

    const ref = doc(
      collection(
        firestore,
        Collections.CLASS_SESSIONS
      )
    );

    const session: ClassSession = {

      id: ref.id,

      courseId,

      teacherUid,

      quantumLock: this.generateQuantumLock(),

      duration,

      status: SessionStatus.ACTIVE,

      createdAt: serverTimestamp(),

      expiresAt: Timestamp.fromDate(
        new Date(
          Date.now() + duration * 60 * 1000
        )
      )

    };

    await setDoc(
      ref,
      session
    );

    return session;

  }

  private generateAccessCode(): string {

    return Math.floor(
      100000 + Math.random() * 900000
    ).toString();

  }

  private generateQuantumLock(): QuantumLock {

  return {

    positions: Array.from(

      { length: 5 },

      () => this.randomDirection()

    )

  };

}

private randomDirection(): QuantumDirection {

  return this.directions[
    Math.floor(
      Math.random() * this.directions.length
    )
  ];

}

  private randomAngle(): number {

    return Math.floor(
      Math.random() * 360
    );

  }

}