import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { CourseService } from '../../../../core/services/course.service';
import { ClassSessionService } from '../../../../core/services/class-session.service';

import { REWARD_CARDS } from '../../../../shared/data/reward-cards';

import { RewardRarity } from '../../../../core/enums/reward-rarity';

import {
  isWithinSchedule,
  StudentReportRow
} from '../../../../core/utils/domain';

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './album.html',
  styleUrl: './album.scss'
})
export class Album {

  private readonly route = inject(ActivatedRoute);

  readonly courseId = this.route.snapshot.paramMap.get('courseId');

  private readonly auth =
    inject(AuthService);

  private readonly attendanceService =
    inject(AttendanceService);

  private readonly courseService =
    inject(CourseService);

  private readonly sessionService =
    inject(ClassSessionService);

  readonly course =
    computed(() => {

      const courseId =
        this.courseId;

      if (!courseId) {

        return undefined;

      }

      return this.courseService.courses()
        .find(item => item.id === courseId);

    });

  readonly courseName =
    computed(() => {

      const courseId =
        this.courseId;

      if (!courseId) {

        return '';

      }

      const course =
        this.courseService.courses()
          .find(item => item.id === courseId);

      return course?.name || '';

    });

  /**
   * RQ08 — Estado de la descarga del reporte.
   */
  readonly reporting = signal(false);
  readonly reportError = signal('');

  /**
   * RQ09 — Botón de asistencia (repuesto) en el álbum:
   * aparece cuando la hora actual está dentro del horario
   * de la materia y ya no existe una sesión del maestro
   * activa (la sesión se cerró).
   */
  readonly sessionActive = signal(false);
  readonly attendanceRegistering = signal(false);
  readonly attendanceMessage = signal('');
  readonly attendanceError = signal('');

  readonly withinSchedule = computed(() =>
    isWithinSchedule(
      this.course()?.schedule,
      Date.now()
    )
  );

  readonly showAttendanceButton = computed(() =>
    Boolean(this.courseId) &&
    this.withinSchedule() &&
    !this.sessionActive()
  );

  readonly loading =
    signal(true);

  readonly error =
    signal('');


  readonly rewardCounts =
    signal<Record<string, number>>({});


  readonly cards =
    computed(() => {

      const counts =
        this.rewardCounts();

      return REWARD_CARDS.map(card => {

        const quantity =
          counts[card.id] ?? 0;

        return {

          ...card,

          quantity,

          collected:
            quantity > 0

        };

      });

    });


  readonly collectedCount =
    computed(() => {

      return this.cards()
        .filter(
          card => card.collected
        )
        .length;

    });

  readonly totalCards =
    computed(() => {

      return REWARD_CARDS.length;

    });



  readonly totalObtained =
    computed(() => {

      return Object.values(
        this.rewardCounts()
      ).reduce(

        (total, quantity) =>
          total + quantity,

        0

      );

    });

  readonly progress =
    computed(() => {

      const total =
        this.totalCards();

      if (!total) {

        return 0;

      }

      return Math.round(

        (
          this.collectedCount()
          / total
        ) * 100

      );

    });

  readonly commonCount =
    computed(() =>
      this.countByRarity(
        RewardRarity.COMMON
      )
    );

  readonly rareCount =
    computed(() =>
      this.countByRarity(
        RewardRarity.RARE
      )
    );

  readonly epicCount =
    computed(() =>
      this.countByRarity(
        RewardRarity.EPIC
      )
    );

  readonly legendaryCount =
    computed(() =>
      this.countByRarity(
        RewardRarity.LEGENDARY
      )
    );


  constructor() {

    this.load();

  }

  async load() {

    try {

      if (!this.courseId) {

        this.error.set(
          'No se especificó el curso.'
        );

        return;

      }


      const user =
        this.auth.currentUser();

      if (!user) {

        this.error.set(
          'No se encontró el usuario.'
        );

        return;

      }


      const counts =
        await this.attendanceService
          .getStudentRewardCounts(
            user.uid,
            this.courseId!
          );

      this.rewardCounts.set(
        counts
      );

      const activeSession =
        await this.sessionService
          .findActiveSession(
            this.courseId!
          );

      this.sessionActive.set(
        activeSession !== null
      );

    } catch (error) {

      console.error(
        'Error cargando álbum:',
        error
      );

      this.error.set(
        'No fue posible cargar tu álbum.'
      );

    } finally {

      this.loading.set(false);

    }

  }

  /**
   * RQ09 — Botón de asistencia del álbum (repuesto).
   * Registra manualmente la asistencia del estudiante en
   * la última sesión del curso cuando la sesión del
   * maestro ya se cerró y el estudiante se encuentra
   * dentro del horario de la materia. No otorga carta.
   */
  async registerAttendance() {

    if (this.attendanceRegistering()) {

      return;

    }

    const user =
      this.auth.currentUser();

    if (!user || !this.courseId) {

      this.attendanceError.set(
        'No es posible registrar la asistencia en este momento.'
      );

      return;

    }

    this.attendanceRegistering.set(true);

    this.attendanceMessage.set('');

    this.attendanceError.set('');

    try {

      const session =
        await this.sessionService
          .getLatestSession(this.courseId);

      if (!session) {

        this.attendanceError.set(
          'No hay una sesión previa para registrar tu asistencia.'
        );

        return;

      }

      const created =
        await this.attendanceService
          .registerManualAttendance(
            session,
            user.uid
          );

      this.attendanceMessage.set(
        created
          ? 'Tu asistencia fue registrada manualmente.'
          : 'Ya tenías asistencia registrada en esta sesión.'
      );

    } catch (error) {

      console.error(
        'Error registrando asistencia desde el álbum:',
        error
      );

      this.attendanceError.set(
        'No fue posible registrar tu asistencia. Inténtalo nuevamente.'
      );

    } finally {

      this.attendanceRegistering.set(false);

    }

  }

  private countByRarity(
    rarity: RewardRarity
  ) {

    const cards =
      this.cards().filter(
        card =>
          card.rarity === rarity
      );


    const collected =
      cards.filter(
        card =>
          card.collected
      );


    return {

      collected:
        collected.length,

      total:
        cards.length

    };

  }

  /**
   * RQ08 — Descarga el reporte por curso del estudiante
   * en formato PDF. Solo usa los datos Firestore del
   * estudiante autenticado y no modifica ninguno.
   */
  async downloadReport() {

    if (this.reporting()) {

      return;

    }

    const courseId =
      this.courseId;

    const user =
      this.auth.currentUser();

    if (!courseId || !user) {

      this.reportError.set(
        'No es posible generar el reporte en este momento.'
      );

      return;

    }

    this.reporting.set(true);

    this.reportError.set('');

    try {

      const rows =
        await this.attendanceService
          .getStudentCourseReport(
            user.uid,
            courseId
          );

      const { jsPDF } =
        await import('jspdf');

      const autoTable =
        (await import('jspdf-autotable'))
          .default;

      this.generatePdf(
        jsPDF,
        autoTable,
        rows,
        user,
        courseId
      );

    } catch (error) {

      console.error(
        'Error generando reporte:',
        error
      );

      this.reportError.set(
        'No fue posible generar el reporte. Inténtalo nuevamente.'
      );

    } finally {

      this.reporting.set(false);

    }

  }

  private generatePdf(
    jsPDFType: typeof import('jspdf').jsPDF,
    autoTable: typeof import('jspdf-autotable').default,
    rows: StudentReportRow[],
    user: { firstName: string; lastName: string },
    courseId: string
  ) {

    const doc = new jsPDFType();

    const fullName =
      [user.firstName, user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

    doc.setFontSize(16);

    doc.text(
      'Reporte de Participación',
      14,
      20
    );

    doc.setFontSize(11);

    doc.text(
      'Quantum Lock',
      14,
      27
    );

    doc.setFontSize(10);

    doc.text(
      `Materia: ${this.courseName() || courseId}`,
      14,
      36
    );

    doc.text(
      `Estudiante: ${fullName}`,
      14,
      43
    );

    autoTable(doc, {

      startY: 50,

      head: [
        [
          'Fecha',
          'Estado',
          'Cartas'
        ]
      ],

      body: rows.map(row => [
        row.fecha,
        row.estado,
        String(row.cartas)
      ]),

      styles: {
        fontSize: 10,
        cellPadding: 3
      },

      headStyles: {
        fillColor: [37, 99, 235]
      },

      columnStyles: {
        2: { halign: 'center' }
      }

    });

    const total = rows.reduce(
      (sum, row) => sum + row.cartas,
      0
    );

    const afterTable = (doc as unknown as {
      lastAutoTable: { finalY: number };
    }).lastAutoTable.finalY + 12;

    doc.setFontSize(12);

    doc.text(
      `Total de cartas: ${total}`,
      14,
      afterTable
    );

    const baseName =
      this.courseName()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      courseId;

    doc.save(`reporte-${baseName}.pdf`);

  }

}