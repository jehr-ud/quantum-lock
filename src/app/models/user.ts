import { Timestamp } from 'firebase/firestore';

import { UserRole } from '../core/enums/user-role';

export interface User {

  uid: string;

  email: string;

  firstName: string;

  lastName: string;

  role: UserRole;

  avatar: number;

  createdAt: Timestamp;

  lastLogin: Timestamp;

}