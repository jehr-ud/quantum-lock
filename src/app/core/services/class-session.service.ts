import { Injectable, signal, inject } from '@angular/core';

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
import { ConfigService } from './config.service';


@Injectable({
  providedIn: 'root'
})
export class ClassSessionService {
  private readonly config = inject(ConfigService);
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
    teacherUid: string
  ): Promise<ClassSession> {

    const ref = doc(
      collection(
        firestore,
        Collections.CLASS_SESSIONS
      )
    );

    const durationSeconds = this.config.config()?.sessionDurationSeconds ?? 30;

    const session: ClassSession = {

      id: ref.id,

      courseId,

      teacherUid,

      quantumLock: this.generateQuantumLock(),

      durationSeconds,

      status: SessionStatus.ACTIVE,

      createdAt: serverTimestamp(),

      expiresAt: Timestamp.fromDate(
        new Date(
          Date.now() + durationSeconds * 1000
        )
      )

    };

    await setDoc(
      ref,
      session
    );

    return session;

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

}