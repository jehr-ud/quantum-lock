import { Injectable, signal } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

import {
  getDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { AppConfig } from '../config/app.config';

import { Collections } from '../constants/firestore.collections';
import { auth, firestore } from '../firebase/firebase';
import { UserRole } from '../enums/user-role';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loading = signal(false);

  async login(
    email: string,
    password: string
  ): Promise<User> {

    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateDoc(
      doc(firestore, Collections.USERS, credential.user.uid),
      {
        lastLogin: serverTimestamp()
      }
    );

    return this.getUser(credential.user.uid);

  }


  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<User> {

    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user: User = {
      uid: credential.user.uid,
      email,
      firstName,
      lastName,
      role: this.getUserRole(email),
      avatar: 1,
      createdAt: serverTimestamp() as any,
      lastLogin: serverTimestamp() as any
    };

    await setDoc(

      doc(
        firestore,
        Collections.USERS,
        user.uid
      ),

      user

    );

    return user;

  }

  private async getUser(
    uid: string
  ): Promise<User> {

    const snapshot = await getDoc(

      doc(
        firestore,
        Collections.USERS,
        uid
      )

    );

    if (!snapshot.exists()) {

      throw new Error(
        'USER_PROFILE_NOT_FOUND'
      );

    }

    return snapshot.data() as User;

  }

  private getUserRole(email: string): UserRole {

    const admin = AppConfig.admins.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    return admin?.role ?? UserRole.STUDENT;

  }
}