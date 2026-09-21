import { Attendance } from '../../models/attendance';
import { CourseScheduleSlot } from '../../models/course';
import { SessionStatus } from '../enums/session-status';

export interface AttendanceExportRow {
  fecha: string;
  estudiante: string;
  correo: string;
  abrioSobre: 'Sí' | 'No';
}

/**
 * RQ05 — Fila consolidada por estudiante: cuántos sobres
 * (cartas, contando duplicados) abrió en el curso.
 */
export interface StudentSummaryRow {
  nombre: string;
  correo: string;
  sobres: number;
}

export interface StudentInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface StudentReportRow {
  fecha: string;
  estado: 'Resolvió' | 'Falló';
  cartas: number;
}

/**
 * RQ09 — Obtiene el día de la semana y los minutos del
 * día en la zona horaria de Colombia (America/Bogota,
 * UTC-5 sin horario de verano).
 */
export function getColombiaTimeParts(
  now: number
): {
  day: number;
  minutes: number;
} {

  const parts = new Intl.DateTimeFormat(
    'en-US',
    {
      timeZone: 'America/Bogota',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  ).formatToParts(new Date(now));

  const values: Record<string, string> = {};

  for (const part of parts) {

    values[part.type] = part.value;

  }

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  let hour = Number(values['hour']);

  if (hour === 24) {

    hour = 0;

  }

  return {
    day: dayMap[values['weekday']] ?? 0,
    minutes:
      hour * 60 +
      (Number(values['minute']) || 0)
  };

}

/**
 * RQ09 — Convierte una hora en formato 'HH:mm' a los
 * minutos transcurridos desde medianoche.
 */
export function minutesOfDay(
  time: string
): number {

  const [hours, minutes] = time
    .split(':')
    .map(Number);

  return (hours || 0) * 60 + (minutes || 0);

}

/**
 * RQ09 — Determina si una fecha/hora en Colombia cae
 * dentro de alguno de los bloques de horario del curso.
 * Un curso sin horario definido no restringe la
 * participación.
 */
export function isWithinSchedule(
  schedule: CourseScheduleSlot[] | null | undefined,
  now: number
): boolean {

  if (!schedule || schedule.length === 0) {

    return true;

  }

  const { day, minutes } =
    getColombiaTimeParts(now);

  return schedule.some(slot =>

    slot.day === day &&
    minutes >= minutesOfDay(slot.start) &&
    minutes < minutesOfDay(slot.end)

  );

}

/**
 * RQ06 — Determina si una sesión está disponible
 * para que un estudiante participe.
 */
export function isSessionUsable(
  session: {
    status: SessionStatus;
    expiresAt?: unknown;
  } | null,
  now: number
): boolean {

  if (!session) {

    return false;

  }

  if (session.status !== SessionStatus.ACTIVE) {

    return false;

  }

  const expires = session.expiresAt as
    | { toMillis?: () => number }
    | undefined;

  if (
    expires &&
    typeof expires.toMillis === 'function'
  ) {

    if (expires.toMillis() <= now) {

      return false;

    }

  }

  return true;

}

/**
 * RQ02 — Cuenta estudiantes distintos a partir
 * de los registros de asistencia de una sesión.
 */
export function countDistinctStudents(
  attendances: Attendance[]
): number {

  const uids = new Set<string>();

  for (const attendance of attendances) {

    if (attendance.studentUid) {

      uids.add(attendance.studentUid);

    }

  }

  return uids.size;

}

/**
 * RQ03 — Calcula la cantidad de veces que el estudiante
 * obtuvo cada carta para el curso seleccionado.
 * Solo cuenta recompensas cuya entrega fue reclamada
 * (cargan un rewardId válido).
 */
export function computeRewardCounts(
  attendances: Attendance[]
): Record<string, number> {

  const counts: Record<string, number> = {};

  for (const attendance of attendances) {

    if (
      attendance.rewardClaimed &&
      attendance.rewardId
    ) {

      counts[attendance.rewardId] =
        (counts[attendance.rewardId] ?? 0) + 1;

    }

  }

  return counts;

}

/**
 * RQ05 — Convierte una fecha persistida en un texto
 * legible para el reporte de asistencia.
 */
export function formatExportDate(
  registeredAt: unknown
): string {

  const value = registeredAt as
    | { toDate?: () => Date }
    | null;

  const date = value?.toDate?.();

  if (!date || isNaN(date.getTime())) {

    return '';

  }

  const pad = (number: number) =>
    number.toString().padStart(2, '0');

  return [
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  ].join(' ');

}

/**
 * RQ05 — Construye las filas del reporte de asistencia
 * a partir de los registros y la información de los
 * estudiantes. Cada registro produce una única fila.
 */
export function buildExportRows(
  attendances: Attendance[],
  usersById: Record<string, StudentInfo>
): AttendanceExportRow[] {

  return attendances
    .map(attendance => {

      const user =
        usersById[attendance.studentUid];

      const fullName = user
        ? [user.firstName, user.lastName]
            .filter(Boolean)
            .join(' ')
            .trim()
        : '';

      const row: AttendanceExportRow = {
        fecha: formatExportDate(
          attendance.registeredAt
        ),
        estudiante: fullName,
        correo: user?.email ?? '',
        abrioSobre: attendance.rewardClaimed
          ? 'Sí'
          : 'No'
      };

      return row;

    })
    .sort((a, b) =>
      a.fecha.localeCompare(b.fecha)
    );

}

/**
 * RQ05 — Consolida por estudiante la cantidad de sobres
 * abiertos (cartas obtenidas, contando duplicados) en el
 * curso. Cada asistencia con el sobre abierto suma un
 * sobre, reflejando el estado de recompensa.
 */
export function buildStudentSummaryRows(
  attendances: Attendance[],
  usersById: Record<string, StudentInfo>
): StudentSummaryRow[] {

  const byUid = new Map<string, StudentSummaryRow>();

  for (const attendance of attendances) {

    if (!attendance.studentUid) {

      continue;

    }

    const user =
      usersById[attendance.studentUid];

    let row =
      byUid.get(attendance.studentUid);

    if (!row) {

      row = {
        nombre: user
          ? [
              user.firstName,
              user.lastName
            ]
            .filter(Boolean)
            .join(' ')
            .trim()
          : '',
        correo: user?.email ?? '',
        sobres: 0
      };

      byUid.set(
        attendance.studentUid,
        row
      );

    }

    if (attendance.rewardClaimed) {

      row.sobres += 1;

    }

  }

  return Array
    .from(byUid.values())
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );

}

/**
 * RQ08 — Construye las filas del reporte por curso del
 * estudiante a partir de sus registros de asistencia.
 * Cada sesión produce una única fila. Una participación
 * fallida aparece con cero cartas. La cantidad de cartas
 * por fila y el total derivan del mismo estado de
 * recompensa usado por el álbum.
 */
export function buildStudentReportRows(
  attendances: Attendance[]
): StudentReportRow[] {

  return attendances
    .map((attendance): StudentReportRow => ({
      fecha: formatExportDate(
        attendance.registeredAt
      ),
      estado: attendance.solved
        ? 'Resolvió'
        : 'Falló',
      cartas:
        attendance.rewardClaimed &&
        attendance.rewardId
          ? 1
          : 0
    }))
    .sort((a, b) =>
      a.fecha.localeCompare(b.fecha)
    );

}