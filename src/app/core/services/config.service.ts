import { Injectable, signal } from '@angular/core';

import {
  doc,
  getDoc
} from 'firebase/firestore';

import { firestore } from '../firebase/firebase';
import { auth } from '../firebase/firebase';

import { Collections } from '../constants/firestore.collections';

import { AppConfiguration } from '../../models/app-config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  readonly config =
    signal<AppConfiguration | null>(null);

  async load(): Promise<void> {

    console.log("usuario", auth.currentUser);

    const snapshot = await getDoc(

      doc(
        firestore,
        Collections.SETTINGS,
        'application'
      )

    );

    if (snapshot.exists()) {

      this.config.set(
        snapshot.data() as AppConfiguration
      );

    }

  }

}