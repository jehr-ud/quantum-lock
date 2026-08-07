import { FieldValue, Timestamp } from 'firebase/firestore';

import { QuantumLock } from './quantum-lock';
import { SessionStatus } from '../core/enums/session-status';

export interface ClassSession {

  id: string;

  courseId: string;

  teacherUid: string;

  quantumLock: QuantumLock;

  status: SessionStatus;

  createdAt: Timestamp | FieldValue;

  expiresAt: Timestamp | FieldValue;

  durationSeconds: number;

}