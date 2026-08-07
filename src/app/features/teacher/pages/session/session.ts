import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { Timestamp } from 'firebase/firestore';

import { ClassSessionService } from '../../../../core/services/class-session.service';

import { QuantumLock } from '../../../../shared/components/quantum/quantum-lock/quantum-lock';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [
    QuantumLock
  ],
  templateUrl: './session.html',
  styleUrl: './session.scss'
})
export class Session {

  private readonly route =
    inject(ActivatedRoute);

  private readonly sessionService =
    inject(ClassSessionService);

  readonly sessionId =
    this.route.snapshot.paramMap.get('id');

  readonly session =
    this.sessionService.session;

  /**
   * Solo para forzar el recálculo del temporizador cada segundo.
   */
  readonly now = signal(Date.now());

  constructor() {

    if (this.sessionId) {

      this.sessionService.watchSession(
        this.sessionId
      );

    }

    setInterval(() => {

      this.now.set(Date.now());

    }, 1000);

  }

  readonly timer = computed(() => {

    const session = this.session();

    if (!session) {

      return '--:--';

    }

    if (!(session.expiresAt instanceof Timestamp)) {

      return '--:--';

    }

    const remaining = Math.max(

      0,

      session.expiresAt.toMillis() - this.now()

    );

    const minutes = Math.floor(
      remaining / 60000
    );

    const seconds = Math.floor(
      (remaining % 60000) / 1000
    );

    return `${minutes}:${seconds
      .toString()
      .padStart(2, '0')}`;

  });

}