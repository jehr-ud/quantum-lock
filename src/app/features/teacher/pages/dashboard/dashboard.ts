import {
  Component,
  inject,
  signal
} from '@angular/core';
import { Router } from '@angular/router';

import * as XLSX from 'xlsx';

import { CourseService } from '../../../../core/services/course.service';
import { ClassSessionService } from '../../../../core/services/class-session.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { CourseHeader } from '../../../../shared/components/course/course-header/course-header';
import { CourseList } from '../../../../shared/components/course/course-list/course-list';
import { Course } from '../../../../models/course';
import { AuthService } from '../../../../core/services/auth.service';
import { ClassSession } from '../../../../models/class-session';
import { SessionCreatedDialog } from '../../../../shared/components/session/session-created-dialog/session-created-dialog';
import { ManualRewardDialog } from '../../../../shared/components/reward/manual-reward-dialog/manual-reward-dialog';
import { User } from '../../../../models/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CourseHeader,
    CourseList,
    SessionCreatedDialog,
    ManualRewardDialog
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  private readonly courseService = inject(CourseService);
  private readonly auth = inject(AuthService);
  private readonly sessionService = inject(ClassSessionService);
  private readonly attendanceService = inject(AttendanceService);

  private readonly router = inject(Router);
  readonly courses = this.courseService.courses;
  sessionCreated = signal<ClassSession | null>(null);

  /**
   * RQ05 — Estado del exportador de asistencia.
   */
  readonly exportingCourseId = signal<string | null>(null);
  readonly exportError = signal('');

  /**
   * RQ07 — Estado de la acción de cerrar sesión.
   */
  readonly logouting = signal(false);
  readonly logoutError = signal('');

  /**
   * RQ10 — Estado de la acción de asignar un sobre
   * manualmente a un estudiante.
   */
  readonly rewardCourse = signal<Course | null>(null);
  readonly students = signal<User[]>([]);
  readonly assigningReward = signal(false);
  readonly rewardSearchError = signal('');
  readonly assignError = signal('');

  /**
   * RQ10 — Abre el diálogo de asignación de sobre
   * para el curso seleccionado y carga los
   * estudiantes disponibles.
   */
  async openAssignReward(course: Course) {

    this.rewardCourse.set(course);

    this.assignError.set('');

    this.rewardSearchError.set('');

    try {

      const students =
        await this.attendanceService.getAllStudents();

      this.students.set(students);

    } catch (error) {

      console.error(
        'Error cargando estudiantes:',
        error
      );

      this.rewardSearchError.set(
        'No fue posible cargar la lista de estudiantes. Inténtalo nuevamente.'
      );

      this.students.set([]);

    }

  }

  /**
   * RQ10 — Asigna un sobre con una carta aleatoria al
   * estudiante seleccionado en el curso activo, usando
   * la fecha de asistencia indicada por el profesor para
   * reponer la asistencia.
   */
  async assignReward(assignment: {
    student: User;
    attendanceDate: string;
  }) {

    const course = this.rewardCourse();

    const user = this.auth.currentUser();

    if (!course || !user || this.assigningReward()) {

      return;

    }

    this.assigningReward.set(true);

    this.assignError.set('');

    try {

      const registeredAt =
        new Date(
          `${assignment.attendanceDate}T00:00:00`
        );

      if (isNaN(registeredAt.getTime())) {

        throw new Error(
          'Invalid attendance date'
        );

      }

      await this.attendanceService.assignManualReward(
        course.id,
        assignment.student.uid,
        user.uid,
        registeredAt
      );

      this.rewardCourse.set(null);

      this.students.set([]);

    } catch (error) {

      console.error(
        'Error asignando sobre:',
        error
      );

      this.assignError.set(
        'No fue posible asignar el sobre. Inténtalo nuevamente.'
      );

    } finally {

      this.assigningReward.set(false);

    }

  }

  closeAssignReward() {

    this.rewardCourse.set(null);

    this.students.set([]);

    this.assignError.set('');

  }

  /**
   * RQ07 — Cierra la sesión de Firebase Authentication
   * y redirige al login. No modifica datos de la
   * aplicación.
   */
  async logout() {

    if (this.logouting()) {

      return;

    }

    this.logouting.set(true);

    this.logoutError.set('');

    try {

      await this.auth.signOut();

      await this.router.navigate([

        '/login'

      ]);

    } catch (error) {

      console.error(
        'Error cerrando sesión:',
        error
      );

      this.logoutError.set(
        'No fue posible cerrar la sesión. Inténtalo nuevamente.'
      );

    } finally {

      this.logouting.set(false);

    }

  }

  async startSession(course: Course) {

    const user = this.auth.currentUser();

    if (!user) {
      return;
    }

    const session = await this.sessionService.createSession(
      course.id,
      user.uid
    );

    this.sessionCreated.set(session);

  }

  enterSession() {

    const session = this.sessionCreated();

    if (!session) {
      return;
    }

    this.router.navigate([
      '/teacher/session',
      session.id
    ]);

  }

  closeDialog() {

    this.sessionCreated.set(null);

  }

  /**
   * RQ05 — Descarga el reporte de asistencia del
   * curso seleccionado como un archivo Excel.
   */
  async exportAttendance(course: Course) {

    if (this.exportingCourseId()) {

      return;

    }

    this.exportingCourseId.set(course.id);

    this.exportError.set('');

    try {

      const [rows, summary] =
        await Promise.all([

          this.attendanceService.getCourseAttendance(
            course.id
          ),

          this.attendanceService.getCourseStudentSummary(
            course.id
          )

        ]);

      this.downloadReport(
        rows,
        summary,
        course
      );

    } catch (error) {

      console.error(
        'Error exportando asistencia:',
        error
      );

      this.exportError.set(
        'No fue posible generar el reporte de asistencia. Inténtalo nuevamente.'
      );

    } finally {

      this.exportingCourseId.set(null);

    }

  }

  private downloadReport(
    rows: {
      fecha: string;
      estudiante: string;
      correo: string;
      abrioSobre: string;
    }[],
    summary: {
      nombre: string;
      correo: string;
      sobres: number;
    }[],
    course: Course
  ) {

    const header = [
      'Fecha',
      'Estudiante',
      'Correo',
      'Abrió sobre'
    ];

    const rowData = rows.map(row => [
      row.fecha,
      row.estudiante,
      row.correo,
      row.abrioSobre
    ]);

    const worksheet =
      XLSX.utils.aoa_to_sheet([
        header,
        ...rowData
      ]);

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 34 },
      { wch: 34 },
      { wch: 12 }
    ];

    const summaryHeader = [
      'Nombre',
      'Correo',
      'Cantidad de sobres'
    ];

    const summaryData = summary.map(row => [
      row.nombre,
      row.correo,
      row.sobres
    ]);

    const summaryWorksheet =
      XLSX.utils.aoa_to_sheet([
        summaryHeader,
        ...summaryData
      ]);

    summaryWorksheet['!cols'] = [
      { wch: 34 },
      { wch: 34 },
      { wch: 18 }
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Asistencia'
    );

    XLSX.utils.book_append_sheet(
      workbook,
      summaryWorksheet,
      'Resumen por estudiante'
    );

    const data =
      XLSX.write(
        workbook,
        {
          bookType: 'xlsx',
          type: 'array'
        }
      );

    const blob = new Blob(
      [data],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = url;

    anchor.download =
      `asistencia-${course.code || course.id}.xlsx`;

    anchor.click();

    URL.revokeObjectURL(url);

  }

}