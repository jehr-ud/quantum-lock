import {
  Component,
  computed,
  inject,
  signal,
  OnDestroy
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Timestamp } from 'firebase/firestore';

import { QuantumLock } from '../../../../shared/components/quantum/quantum-lock/quantum-lock';
import { ClassSession } from '../../../../models/class-session';
import { User } from '../../../../models/user';
import { ClassSessionService } from '../../../../core/services/class-session.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfigService } from '../../../../core/services/config.service';
import { isSessionUsable } from '../../../../core/utils/domain';

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

  private readonly config =
    inject(ConfigService);

  readonly loading =
    signal(true);

  readonly session =
    signal<ClassSession | null>(null);

  readonly remainingSeconds = signal(0);

  readonly error = signal('');

  readonly loadError = signal('');

  readonly unavailable = signal(false);

  readonly attended = signal(false);

  /**
   * Intentos fallidos registrados para la sesión actual.
   * La fuente de verdad es el documento de asistencia en
   * Firestore; esta señal se inicializa desde él.
   */
  readonly attempts = signal(0);

  readonly shaking = signal(false);

  readonly courseId =
    this.route.snapshot.paramMap.get('courseId');

  private timerId?: number;

  private unsubscribe?: () => void;

  constructor() {

    this.load();

  }

  ngOnDestroy() {

    if (this.timerId) {

      clearInterval(this.timerId);

      this.timerId = undefined;

    }

    this.unsubscribe?.();

  }

  /**
   * RQ06 — Sesión válida para participar: debe estar
   * activa y no haber expirado.
   */
  readonly activeSession = computed(() => {

    const session = this.session();

    if (!isSessionUsable(session, Date.now())) {

      return null;

    }

    return session;

  });

  readonly interactive = computed(() => {

    if (this.unavailable()) {

      return false;

    }

    return this.activeSession() !== null && this.attended();

  });

  /**
   * Límite de intentos fallidos definido en la
   * configuración de la aplicación.
   */
  readonly maxAttempts = computed(() =>

    this.config.config()?.maxAttempts ?? 3

  );

  /**
   * El estudiante agotó el máximo de intentos fallidos:
   * el Quantum Lock queda bloqueado sin revelar el patrón.
   */
  readonly attemptsExhausted = computed(() =>

    this.attempts() >= this.maxAttempts()

  );

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

  async load() {

    if (!this.courseId) {

      this.loading.set(false);

      return;

    }

    this.unsubscribe?.();

    this.unsubscribe = undefined;

    this.loading.set(true);

    this.loadError.set('');

    this.unavailable.set(false);

    this.error.set('');

    this.attended.set(false);

    this.attempts.set(0);

    try {

      const session = await this.sessionService
          .findActiveSession(this.courseId);

      this.session.set(session);

      if (session) {

        await this.registerAttendance(session);

        this.startTimer(session);

        this.unsubscribe =

          this.sessionService.watchSessionStatus(

            session.id,

            updated =>
              this.onSessionUpdate(updated),

            error => {

              console.error(
                'Error observando la sesión:',
                error
              );

              this.loadError.set(
                'No fue posible cargar la información de la sesión. Inténtalo nuevamente.'
              );

            }

          );

      }

    } catch (error) {

      console.error(
        'Error cargando la sesión:',
        error
      );

      this.loadError.set(
        'No fue posible cargar la información de la sesión. Inténtalo nuevamente.'
      );

    } finally {

      this.loading.set(false);

    }

  }

  retry() {

    this.load();

  }

  /**
   * RQ09 — Registra la asistencia en el momento en que
   * el estudiante entra a la sesión ("Comenzar"). Solo
   * habilita el Quantum Lock si el registro es exitoso.
   */
  private async registerAttendance(
    session: ClassSession
  ): Promise<void> {

    const user =
      await this.resolveCurrentUser();

    if (!user) {

      return;

    }

    try {

      await this.attendanceService.attend(
        session,
        user.uid
      );

      const attendance =
        await this.attendanceService.getAttendance(
          session.id,
          user.uid
        );

      this.attempts.set(
        attendance?.attempts ?? 0
      );

      this.attended.set(true);

    } catch (error) {

      console.error(
        'Error registrando asistencia:',
        error
      );

      this.error.set(
        'No fue posible registrar tu asistencia. Inténtalo nuevamente.'
      );

    }

  }

  /**
   * RQ06 — Si la sesión deja de estar disponible
   * durante la interacción, se detiene la
   * participación de forma segura.
   */
  private onSessionUpdate(
    updated: ClassSession | null
  ) {

    if (
      !updated ||
      !isSessionUsable(updated, Date.now())
    ) {

      this.handleUnavailable();

    }

  }

  private handleUnavailable() {

    this.unavailable.set(true);

    if (this.timerId) {

      clearInterval(this.timerId);

      this.timerId = undefined;

    }

  }

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

        this.timerId = undefined;

        this.handleUnavailable();

      }

    };

    update();

    this.timerId = window.setInterval(

      update,

      1000

    );

  }

  /**
   * RQ06/RQ09 — Devuelve el usuario autenticado. Si la
   * señal `currentUser` está momentáneamente en `null`
   * por un re-sync del SDK de Firebase, primero espera
   * a que el estado de autenticación quede establecido.
   */
  private async resolveCurrentUser(): Promise<User | null> {

    let user =
      this.auth.currentUser();

    if (!user) {

      await this.auth.waitForAuthState();

      user =
        this.auth.currentUser();

    }

    return user;

  }

  /**
   * RQ06 — Revalida el estado de la sesión justo antes
   * de aceptar la resolución del Quantum Lock.
   */
  private async refreshActiveSession(): Promise<ClassSession | null> {

    const current =
      this.session();

    if (!current?.id) {

      return null;

    }

    try {

      const fresh =
        await this.sessionService
          .getSessionById(current.id);

      if (
        fresh &&
        isSessionUsable(fresh, Date.now())
      ) {

        return fresh;

      }

      return null;

    } catch (error) {

      console.error(
        'Error revalidando la sesión:',
        error
      );

      this.loadError.set(
        'No fue posible cargar la información de la sesión. Inténtalo nuevamente.'
      );

      return null;

    }

  }

  async solved() {

    const user =
      await this.resolveCurrentUser();

    if (!user) {

      return;

    }

    const session =
      await this.refreshActiveSession();

    if (!session) {

      this.handleUnavailable();

      return;

    }

    try {

      await this.attendanceService.register(
        session,
        user.uid
      );

      await this.router.navigate([

        '/student/envelope',

        session.courseId

      ]);

    } catch (error: any) {

      if (
        error?.message === 'SESSION_NOT_ACTIVE' ||
        error?.message === 'SESSION_EXPIRED'
      ) {

        this.handleUnavailable();

        return;

      }

      console.error(
        'Error registrando asistencia:',
        error
      );

      this.error.set(
        'No fue posible registrar tu asistencia. Inténtalo nuevamente.'
      );

    }

  }

  async failed() {

    const user =
      await this.resolveCurrentUser();

    const session =
      this.activeSession();

    if (!user || !session) {

      this.handleUnavailable();

      return;

    }

    try {

      await this.attendanceService
        .registerFailedAttempt(
          session,
          user.uid
        );

    } catch (error: any) {

      if (
        error?.message === 'SESSION_NOT_ACTIVE' ||
        error?.message === 'SESSION_EXPIRED'
      ) {

        this.handleUnavailable();

        return;

      }

      console.error(
        'Error registrando intento:',
        error
      );

      this.error.set(
        'No fue posible registrar tu intento. Inténtalo nuevamente.'
      );

      return;

    }

    const attempts =
      this.attempts() + 1;

    this.attempts.set(attempts);

    if (this.attemptsExhausted()) {

      this.error.set(
        `Alcanzaste el máximo de ${this.maxAttempts()} intentos. Tu asistencia quedó registrada.`
      );

      return;

    }

    this.error.set(
      'El patrón no coincide.'
    );

    this.shaking.set(true);

    setTimeout(() => {

      this.shaking.set(false);

    }, 600);

  }

}