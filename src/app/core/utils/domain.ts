import { Attendance } from '../../models/attendance';
import { SessionStatus } from '../enums/session-status';

export interface AttendanceExportRow {
  fecha: string;
  estudiante: string;
  correo: string;
  abrioSobre: 'Sí' | 'No';
}

export interface StudentInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
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