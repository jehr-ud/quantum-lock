import {
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { User } from '../../../../models/user';
import { filterStudents } from '../../../../core/utils/domain';

/**
 * RQ10 — Convierte una fecha local a su representación
 * ISO (aaaa-mm-dd) en la zona horaria del dispositivo.
 */
function toIsoDate(date: Date): string {

  const pad = (number: number) =>
    number.toString().padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-');

}

@Component({
  selector: 'app-manual-reward-dialog',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './manual-reward-dialog.html',
  styleUrl: './manual-reward-dialog.scss'
})
export class ManualRewardDialog {

  readonly students =
    input.required<User[]>();

  readonly courseName =
    input('');

  readonly courseId =
    input('');

  readonly assigning =
    input(false);

  readonly error =
    input('');

  readonly searchError =
    input('');

  readonly assign =
    output<{
      student: User;
      attendanceDate: string;
    }>();

  readonly close =
    output<void>();

  readonly search =
    signal('');

  readonly filteredStudents =
    computed(() =>
      filterStudents(
        this.students(),
        this.search()
      )
    );

  /**
   * RQ10 — Fecha de asistencia que se restaura al
   * asignar el sobre manualmente. Se preselecciona hoy
   * y no admite fechas futuras.
   */
  readonly todayIso =
    computed(() => toIsoDate(new Date()));

  readonly attendanceDate =
    signal(this.todayIso());

  readonly hasValidDate =
    computed(() =>
      Boolean(this.attendanceDate())
    );

  confirm(student: User) {

    if (!this.hasValidDate()) {

      return;

    }

    this.assign.emit({
      student,
      attendanceDate: this.attendanceDate()
    });

  }

}