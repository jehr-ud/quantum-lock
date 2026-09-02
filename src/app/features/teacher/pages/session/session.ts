import {
  Component,
  computed,
  effect,
  inject,
  signal,
  OnDestroy
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { Timestamp } from 'firebase/firestore';

import { ClassSessionService } from '../../../../core/services/class-session.service';
import { AttendanceService } from '../../../../core/services/attendance.service';

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
export class Session implements OnDestroy {

  private readonly route =
    inject(ActivatedRoute);

  private readonly sessionService =
    inject(ClassSessionService);

  private readonly attendanceService =
    inject(AttendanceService);

  readonly sessionId =
    this.route.snapshot.paramMap.get('id');

  readonly session =
    this.sessionService.session;

  /**
   * RQ02 — Cantidad de estudiantes distintos que han
   * registrado su participación en la sesión actual.
   */
  readonly connectedStudents =
    signal(0);

  readonly connectedError =
    signal(false);

  /**
   * Solo para forzar el recálculo del temporizador cada segundo.
   */
  readonly now = signal(Date.now());

  private unsubscribeCount?: () => void;

  private intervalId?: ReturnType<typeof setInterval>;

  constructor() {

    if (this.sessionId) {

      this.sessionService.watchSession(
        this.sessionId
      );

    }

    this.intervalId = setInterval(() => {

      this.now.set(Date.now());

    }, 1000);

    effect(() => {

      const session = this.session();

      this.unsubscribeCount?.();

      this.unsubscribeCount = undefined;

      this.connectedStudents.set(0);

      this.connectedError.set(false);

      if (!session?.id) {

        return;

      }

      this.unsubscribeCount =

        this.attendanceService.countSessionStudents(

          session.id,

          count => {

            this.connectedStudents.set(
              count
            );

            this.connectedError.set(false);

          },

          error => {

            console.error(
              'Error cargando estudiantes conectados:',
              error
            );

            this.connectedError.set(true);

          }

        );

    });

  }

  ngOnDestroy() {

    this.unsubscribeCount?.();

    if (this.intervalId) {

      clearInterval(this.intervalId);

    }

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