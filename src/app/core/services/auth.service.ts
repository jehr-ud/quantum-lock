import { Injectable, computed, signal, inject } from '@angular/core';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';

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
import { ConfigService } from '../../core/services/config.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loading = signal(false);

  readonly currentUser = signal<User | null>(null);
  readonly initialized = signal(false);

  readonly isAuthenticated = computed(
    () => this.currentUser() !== null
  );

  readonly isTeacher = computed(
    () => this.currentUser()?.role === UserRole.TEACHER
  );

  readonly isStudent = computed(
    () => this.currentUser()?.role === UserRole.STUDENT
  );

  configService = inject(ConfigService);

  constructor() {

  onAuthStateChanged(auth, async firebaseUser => {

  console.log('Firebase user:', firebaseUser);

  try {

    if (!firebaseUser) {

      this.currentUser.set(null);

      return;

    }

    const user = await this.getUser(firebaseUser.uid);

    this.currentUser.set(user);

  } finally {

    this.initialized.set(true);

  }

});

}

  async waitForAuthState(): Promise<FirebaseUser | null> {

  const started = Date.now();

  const settleTimeoutMs = 2000;

  while (Date.now() - started < settleTimeoutMs) {

    const firebaseUser = auth.currentUser;

    if (firebaseUser) {

      if (this.currentUser()?.uid !== firebaseUser.uid) {

        try {

          const user = await this.getUser(firebaseUser.uid);

          this.currentUser.set(user);

        } catch {

          // La lectura del perfil pudo fallar por red o reglas;
          // la sesión de Firebase sigue siendo válida.

        }

      }

      this.initialized.set(true);

      return firebaseUser;

    }

    await new Promise(resolve => setTimeout(resolve, 100));

  }

  this.initialized.set(true);

  this.currentUser.set(null);

  return null;

}

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


    const user = await this.getUser(
      credential.user.uid
    );

    this.currentUser.set(user);

    await this.configService.load();

    return user;

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

    this.currentUser.set(user);

    await this.configService.load();

    return user;

  }

  /**
   * RQ04 — Solicita el restablecimiento de contraseña
   * a través de Firebase Authentication.
   */
  async sendPasswordReset(
    email: string
  ): Promise<void> {

    await sendPasswordResetEmail(
      auth,
      email
    );

  }

  /**
   * RQ07 — Termina la sesión actual de Firebase
   * Authentication. El listener de estado de
   * autenticación actualizará la señal `currentUser`.
   * No se modifica ni elimina ningún dato de la
   * aplicación.
   */
  async signOut(): Promise<void> {

    await firebaseSignOut(
      auth
    );

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