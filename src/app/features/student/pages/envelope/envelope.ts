import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { RewardCard } from '../../../../shared/components/reward/reward-card/reward-card';

import { ClassSessionService } from '../../../../core/services/class-session.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AuthService } from '../../../../core/services/auth.service';

import { ClassSession } from '../../../../models/class-session';
import { Attendance } from '../../../../models/attendance';
import { Reward } from '../../../../models/reward';

@Component({
  selector: 'app-envelope',
  standalone: true,
  imports: [
    RouterLink,
    RewardCard
  ],
  templateUrl: './envelope.html',
  styleUrl: './envelope.scss'
})
export class Envelope {

  private readonly route =
    inject(ActivatedRoute);

  private readonly auth =
    inject(AuthService);

  private readonly sessionService =
    inject(ClassSessionService);

  private readonly attendanceService =
    inject(AttendanceService);

  readonly courseId =
    this.route.snapshot.paramMap.get('courseId');

  readonly loading =
    signal(true);

  readonly opened =
    signal(false);

  readonly canOpen =
    signal(false);

  readonly alreadyClaimed =
    signal(false);

  readonly session =
    signal<ClassSession | null>(null);

  readonly attendance =
    signal<Attendance | null>(null);

  readonly reward =
    signal<Reward | null>(null);

  readonly error =
    signal('');

  constructor() {

    this.load();

  }

  async load() {

    try {

      const user =
        this.auth.currentUser();

      if (!user) {

        this.error.set(
          'No se encontró el usuario.'
        );

        return;

      }

      if (!this.courseId) {

        this.error.set(
          'No se encontró el curso.'
        );

        return;

      }

      /*
       * 1. Buscar la última sesión
       */

      const session =
        await this.sessionService
          .getLatestSession(
            this.courseId
          );

      if (!session) {

        this.error.set(
          'Este curso todavía no tiene sesiones.'
        );

        return;

      }

      this.session.set(session);

      /*
       * 2. Buscar la asistencia
       */

      const attendance =
        await this.attendanceService
          .getAttendance(

            session.id,

            user.uid

          );

      if (!attendance) {

        this.error.set(
          'No tienes una asistencia registrada para la última sesión.'
        );

        return;

      }

      this.attendance.set(
        attendance
      );

      /*
       * 3. Verificar que haya
       * resuelto correctamente
       */

      if (!attendance.solved) {

        this.error.set(
          'Debes completar correctamente el Quantum Lock para obtener la recompensa.'
        );

        return;

      }

      /*
       * 4. Obtener recompensa
       */

      const reward =
        this.attendanceService.getReward(
          attendance.rewardId
        );

      if (!reward) {

        this.error.set(
          'No se encontró la recompensa asociada.'
        );

        return;

      }

      this.reward.set(reward);

      /*
       * 5. Verificar si ya abrió
       * el sobre
       */

      if (attendance.rewardClaimed) {

        this.alreadyClaimed.set(true);

        this.opened.set(true);

      } else {

        this.canOpen.set(true);

      }

    } catch (error) {

      console.error(
        'Error cargando sobre:',
        error
      );

      this.error.set(
        'No fue posible cargar el sobre.'
      );

    } finally {

      this.loading.set(false);

    }

  }

  async open() {

    if (!this.canOpen()) {

      return;

    }

    const user =
      this.auth.currentUser();

    const session =
      this.session();

    if (!user || !session) {

      return;

    }

    const attendance =
      await this.attendanceService
        .claimReward(

          session.id,

          user.uid

        );

    if (!attendance) {

      this.error.set(
        'No fue posible abrir el sobre.'
      );

      return;

    }

    this.opened.set(true);

    this.canOpen.set(false);

    this.alreadyClaimed.set(true);

  }

}