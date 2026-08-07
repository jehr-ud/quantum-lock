import { FieldValue, Timestamp } from 'firebase/firestore';

export interface Attendance {

    uid: string;

    sessionId: string;

    joinedAt: Timestamp | FieldValue;

    validatedAt: Timestamp | FieldValue;

}