import { FieldValue, Timestamp } from 'firebase/firestore';

export interface Attendance {
    id: string;
    sessionId: string;
    courseId: string;
    studentUid: string;
    registeredAt: Timestamp | FieldValue;
    rewardId: string;
    rewardClaimed: boolean;
    solved: boolean;
    attempts: number;
    teacherUid?: string;
    manual?: boolean;
    manualAttendance?: boolean;
}