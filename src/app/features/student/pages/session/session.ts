import {
  Component,
  computed,
  inject,
  signal,
  OnDestroy
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';

import { QuantumLock } from '../../../../shared/components/quantum/quantum-lock/quantum-lock';
import { ClassSession } from '../../../../models/class-session';
import { ClassSessionService } from '../../../../core/services/class-session.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-student-session',
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

  private readonly router =
    inject(Router);

  private readonly auth =
    inject(AuthService);

  private readonly sessionService =
    inject(ClassSessionService);

  private readonly attendanceService =
    inject(AttendanceService);

  readonly loading =
    signal(true);

  readonly session =
    signal<ClassSession | null>(null);

  readonly remainingSeconds = signal(0);

  readonly error = signal('');

  readonly shaking = signal(false);

  readonly courseId =
    this.route.snapshot.paramMap.get('courseId');

  constructor() {

    this.load();

  }

  ngOnDestroy() {

    if (this.timerId) {

      clearInterval(this.timerId);

    }

  }

  async load() {

    if (!this.courseId) {

      return;

    }


    const session =

      await this.sessionService
        .findActiveSession(this.courseId);

    this.session.set(session);

    if (session) {
      this.startTimer(session);

    }

    this.loading.set(false);

  }

  private timerId?: number;

  private startTimer(session: ClassSession) {

    const update = () => {

      const expires = session.expiresAt as Timestamp;

      const seconds = Math.max(

        0,

        Math.floor(

          (expires.toMillis() - Date.now()) / 1000

        )

      );

      this.remainingSeconds.set(seconds);

      if (seconds === 0 && this.timerId) {

        clearInterval(this.timerId);

      }

    };

    update();

    this.timerId = window.setInterval(

      update,

      1000

    );

  }

  readonly timerClass = computed(() => {

    const seconds = this.remainingSeconds();

    if (seconds <= 5) {

      return 'danger';

    }

    if (seconds <= 15) {

      return 'warning';

    }

    return '';

  });

  readonly timer = computed(() => {

    const total = this.remainingSeconds();

    const minutes = Math.floor(total / 60);

    const seconds = total % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, '0')}`;

  });

  async solved() {

    const user =
      this.auth.currentUser();

    const session =
      this.session();

    if (!user || !session) {

      return;

    }

    await this.attendanceService.register(

      session,

      user.uid

    );

    await this.router.navigate([

      '/student/envelope',

      session.courseId

    ]);

  }

  async failed() {

  const user =
    this.auth.currentUser();

  const session =
    this.session();

  if (!user || !session) {

    return;

  }

  await this.attendanceService
    .registerFailedAttempt(

      session,

      user.uid

    );

  this.error.set(
    'El patrón no coincide.'
  );

  this.shaking.set(true);

  setTimeout(() => {

    this.shaking.set(false);

  }, 600);

}

}