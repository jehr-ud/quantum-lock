import { describe, it, expect } from 'vitest';

import { Attendance } from '../../models/attendance';
import { SessionStatus } from '../enums/session-status';

import {
  buildExportRows,
  buildStudentReportRows,
  buildStudentSummaryRows,
  computeRewardCounts,
  countDistinctStudents,
  filterStudents,
  formatExportDate,
  getColombiaTimeParts,
  isSessionUsable,
  isWithinSchedule,
  minutesOfDay,
  AttendanceExportRow
} from './domain';

import { User } from '../../models/user';
import { UserRole } from '../enums/user-role';

function attendance(
  overrides: Partial<Attendance>
): Attendance {

  return {
    id: 'session_student',
    sessionId: 'session',
    courseId: 'course',
    studentUid: 'student',
    registeredAt: timestamp(new Date()) as any,
    rewardId: '',
    rewardClaimed: false,
    solved: false,
    attempts: 0,
    ...overrides
  };

}

function timestamp(
  date: Date
): unknown {

  return {
    toDate: () => date,
    toMillis: () => date.getTime()
  };

}

describe('isSessionUsable', () => {

  it('rechaza una sesión inexistente', () => {

    expect(isSessionUsable(null, Date.now())).toBe(false);

  });

  it('rechaza una sesión no activa', () => {

    expect(
      isSessionUsable(
        { status: SessionStatus.FINISHED },
        Date.now()
      )
    ).toBe(false);

  });

  it('acepta una sesión activa sin vencimiento', () => {

    expect(
      isSessionUsable(
        { status: SessionStatus.ACTIVE },
        Date.now()
      )
    ).toBe(true);

  });

  it('rechaza una sesión activa expirada', () => {

    const expires = timestamp(
      new Date(Date.now() - 1000)
    );

    expect(
      isSessionUsable(
        {
          status: SessionStatus.ACTIVE,
          expiresAt: expires as any
        },
        Date.now()
      )
    ).toBe(false);

  });

  it('acepta una sesión activa vigente', () => {

    const expires = timestamp(
      new Date(Date.now() + 60000)
    );

    expect(
      isSessionUsable(
        {
          status: SessionStatus.ACTIVE,
          expiresAt: expires as any
        },
        Date.now()
      )
    ).toBe(true);

  });

});

describe('minutesOfDay', () => {

  it('convierte las horas al inicio del día', () => {

    expect(
      minutesOfDay('00:00')
    ).toBe(0);

  });

  it('convierte una hora de mañana', () => {

    expect(
      minutesOfDay('07:00')
    ).toBe(420);

  });

  it('convierte el final del día', () => {

    expect(
      minutesOfDay('23:59')
    ).toBe(1439);

  });

});

describe('getColombiaTimeParts', () => {

  it('obtiene el día y la hora en Colombia (UTC-5)', () => {

    const parts = getColombiaTimeParts(
      Date.UTC(2026, 8, 14, 12, 30)
    );

    expect(parts).toEqual({
      day: 1,
      minutes: 450
    });

  });

  it('convierte una hora de la tarde', () => {

    const parts = getColombiaTimeParts(
      Date.UTC(2026, 8, 14, 20, 45)
    );

    expect(parts).toEqual({
      day: 1,
      minutes: 945
    });

  });

});

describe('isWithinSchedule', () => {

  const schedule = [
    { day: 1, start: '07:00', end: '09:00' },
    { day: 3, start: '09:00', end: '11:00' }
  ];

  const mon = Date.UTC(2026, 8, 14, 12, 30);
  const wed = Date.UTC(2026, 8, 16, 15, 0);
  const sun = Date.UTC(2026, 8, 13, 12, 30);

  it('acepta una hora dentro del bloque correcto', () => {

    expect(
      isWithinSchedule(schedule, mon)
    ).toBe(true);

  });

  it('acepta varios bloques en la semana', () => {

    expect(
      isWithinSchedule(schedule, wed)
    ).toBe(true);

  });

  it('rechaza una hora fuera de los bloques del día', () => {

    const late = Date.UTC(2026, 8, 14, 14, 30);

    expect(
      isWithinSchedule(schedule, late)
    ).toBe(false);

  });

  it('rechaza un día sin clase', () => {

    expect(
      isWithinSchedule(schedule, sun)
    ).toBe(false);

  });

  it('incluye la hora de inicio del bloque', () => {

    const start = Date.UTC(2026, 8, 14, 12, 0);

    expect(
      isWithinSchedule(schedule, start)
    ).toBe(true);

  });

  it('excluye la hora de fin del bloque', () => {

    const end = Date.UTC(2026, 8, 14, 14, 0);

    expect(
      isWithinSchedule(schedule, end)
    ).toBe(false);

  });

  it('no restringe cuando no hay horario definido', () => {

    expect(
      isWithinSchedule(undefined, mon)
    ).toBe(true);

    expect(
      isWithinSchedule(null, mon)
    ).toBe(true);

    expect(
      isWithinSchedule([], mon)
    ).toBe(true);

  });

});

describe('countDistinctStudents', () => {

  it('cuenta cero estudiantes sin registros', () => {

    expect(
      countDistinctStudents([])
    ).toBe(0);

  });

  it('cuenta uno por cada estudiante distinto', () => {

    const records = [
      attendance({ studentUid: 'a' }),
      attendance({ studentUid: 'b' })
    ];

    expect(
      countDistinctStudents(records)
    ).toBe(2);

  });

  it('no duplica estudiantes con varios intentos', () => {

    const records = [
      attendance({ studentUid: 'a' }),
      attendance({ studentUid: 'a' }),
      attendance({ studentUid: 'a' })
    ];

    expect(
      countDistinctStudents(records)
    ).toBe(1);

  });

});

describe('computeRewardCounts', () => {

  it('cuenta solo recompensas reclamadas', () => {

    const records = [
      attendance({
        rewardClaimed: true,
        rewardId: 'sp-001'
      }),
      attendance({
        rewardClaimed: false,
        rewardId: 'sp-002'
      }),
      attendance({
        rewardClaimed: true,
        rewardId: ''
      })
    ];

    expect(
      computeRewardCounts(records)
    ).toEqual({ 'sp-001': 1 });

  });

  it('suma duplicados de la misma carta', () => {

    const records = [
      attendance({
        rewardClaimed: true,
        rewardId: 'sp-001'
      }),
      attendance({
        rewardClaimed: true,
        rewardId: 'sp-001'
      }),
      attendance({
        rewardClaimed: true,
        rewardId: 'sp-002'
      })
    ];

    expect(
      computeRewardCounts(records)
    ).toEqual({
      'sp-001': 2,
      'sp-002': 1
    });

  });

});

describe('formatExportDate', () => {

  it('formatea un valor de fecha como día/mes/año hora:minuto', () => {

    const date = new Date(2026, 8, 1, 9, 5);

    expect(
      formatExportDate(timestamp(date))
    ).toBe('01/09/2026 09:05');

  });

  it('devuelve vacío para valores sin fecha', () => {

    expect(
      formatExportDate(null)
    ).toBe('');

  });

});

describe('buildExportRows', () => {

  const users = {
    a: {
      firstName: 'Ana',
      lastName: 'García',
      email: 'agarcia@udistrital.edu.co'
    },
    b: {
      firstName: 'Luis',
      lastName: 'Pérez',
      email: 'lperez@udistrital.edu.co'
    }
  };

  it('genera una fila por registro de asistencia', () => {

    const first = attendance({
      studentUid: 'a',
      rewardClaimed: true,
      registeredAt: timestamp(
        new Date(2026, 8, 1, 9, 0)
      ) as any
    });

    const rows: AttendanceExportRow[] =
      buildExportRows([first], users);

    expect(rows).toHaveLength(1);

    expect(rows[0]).toEqual({
      fecha: '01/09/2026 09:00',
      estudiante: 'Ana García',
      correo: 'agarcia@udistrital.edu.co',
      abrioSobre: 'Sí',
      asistenciaManual: 'No'
    });

  });

  it('marca No al estudiante que no abrió el sobre', () => {

    const failed = attendance({
      studentUid: 'b',
      rewardClaimed: false,
      solved: false,
      registeredAt: timestamp(
        new Date(2026, 8, 1, 9, 0)
      ) as any
    });

    const rows =
      buildExportRows([failed], users);

    expect(rows[0].abrioSobre).toBe('No');

  });

  it('marca Sí la asistencia registrada manualmente por el estudiante', () => {

    const manual = attendance({
      studentUid: 'b',
      solved: true,
      rewardClaimed: false,
      manualAttendance: true,
      registeredAt: timestamp(
        new Date(2026, 8, 1, 9, 0)
      ) as any
    });

    const rows =
      buildExportRows([manual], users);

    expect(rows[0].asistenciaManual).toBe('Sí');

    expect(rows[0].abrioSobre).toBe('No');

  });

  it('genera una fila por registro sin duplicar la misma sesión', () => {

    const records = [
      attendance({
        id: 's_a',
        studentUid: 'a',
        rewardClaimed: true,
        registeredAt: timestamp(
          new Date(2026, 8, 1, 9, 0)
        ) as any
      }),
      attendance({
        id: 's_a',
        studentUid: 'a',
        rewardClaimed: false,
        sessionId: 'session',
        registeredAt: timestamp(
          new Date(2026, 8, 1, 9, 1)
        ) as any
      })
    ];

    const rows =
      buildExportRows(records, users);

    expect(rows).toHaveLength(records.length);

  });

});

describe('buildStudentSummaryRows', () => {

  const users = {
    a: {
      firstName: 'Ana',
      lastName: 'García',
      email: 'agarcia@udistrital.edu.co'
    },
    b: {
      firstName: 'Luis',
      lastName: 'Pérez',
      email: 'lperez@udistrital.edu.co'
    }
  };

  it('genera una fila por estudiante con la cantidad de sobres', () => {

    const records = [
      attendance({
        studentUid: 'a',
        rewardClaimed: true,
        rewardId: 'sp-001'
      }),
      attendance({
        studentUid: 'a',
        rewardClaimed: true,
        rewardId: 'sp-002'
      }),
      attendance({
        studentUid: 'b',
        rewardClaimed: false,
        rewardId: ''
      })
    ];

    const rows =
      buildStudentSummaryRows(records, users);

    expect(rows).toHaveLength(2);

    expect(rows[0]).toEqual({
      nombre: 'Ana García',
      correo: 'agarcia@udistrital.edu.co',
      sobres: 2
    });

    expect(rows[1]).toEqual({
      nombre: 'Luis Pérez',
      correo: 'lperez@udistrital.edu.co',
      sobres: 0
    });

  });

  it('cuenta las cartas duplicadas en el total de sobres', () => {

    const records = [
      attendance({
        studentUid: 'a',
        rewardClaimed: true,
        rewardId: 'sp-001'
      }),
      attendance({
        studentUid: 'a',
        rewardClaimed: true,
        rewardId: 'sp-001'
      }),
      attendance({
        studentUid: 'a',
        rewardClaimed: true,
        rewardId: 'sp-003'
      })
    ];

    const rows =
      buildStudentSummaryRows(records, users);

    expect(rows[0].sobres).toBe(3);

  });

  it('no cuenta sobres no reclamados', () => {

    const records = [
      attendance({
        studentUid: 'a',
        rewardClaimed: false,
        rewardId: 'sp-001'
      }),
      attendance({
        studentUid: 'b',
        rewardClaimed: false,
        rewardId: ''
      })
    ];

    const rows =
      buildStudentSummaryRows(records, users);

    expect(rows[0].sobres).toBe(0);

    expect(rows[1].sobres).toBe(0);

  });

  it('ordena las filas por nombre', () => {

    const records = [
      attendance({
        studentUid: 'b',
        rewardClaimed: true,
        rewardId: 'sp-001'
      }),
      attendance({
        studentUid: 'a',
        rewardClaimed: true,
        rewardId: 'sp-002'
      })
    ];

    const rows =
      buildStudentSummaryRows(records, users);

    expect(rows[0].nombre).toBe('Ana García');

    expect(rows[1].nombre).toBe('Luis Pérez');

  });

  it('devuelve vacío sin registros', () => {

    const rows =
      buildStudentSummaryRows([], users);

    expect(rows).toEqual([]);

  });

});

describe('buildStudentReportRows', () => {

  it('genera una fila por sesión con estado Resolvió y una carta', () => {

    const records = [
      attendance({
        studentUid: 'a',
        solved: true,
        rewardClaimed: true,
        rewardId: 'sp-001',
        registeredAt: timestamp(
          new Date(2026, 8, 1, 9, 0)
        ) as any
      })
    ];

    const rows =
      buildStudentReportRows(records);

    expect(rows).toHaveLength(1);

    expect(rows[0]).toEqual({
      fecha: '01/09/2026 09:00',
      estado: 'Resolvió',
      cartas: 1
    });

  });

  it('marca Falló con cero cartas al estudiante que no resolvió', () => {

    const records = [
      attendance({
        studentUid: 'a',
        solved: false,
        rewardClaimed: false,
        registeredAt: timestamp(
          new Date(2026, 8, 1, 9, 0)
        ) as any
      })
    ];

    const rows =
      buildStudentReportRows(records);

    expect(rows[0]).toEqual({
      fecha: '01/09/2026 09:00',
      estado: 'Falló',
      cartas: 0
    });

  });

  it('no cuenta la carta hasta reclamar la recompensa', () => {

    const records = [
      attendance({
        studentUid: 'a',
        solved: true,
        rewardClaimed: false,
        rewardId: 'sp-001',
        registeredAt: timestamp(
          new Date(2026, 8, 1, 9, 0)
        ) as any
      })
    ];

    const rows =
      buildStudentReportRows(records);

    expect(rows[0].cartas).toBe(0);

  });

  it('una sesión con varios intentos produce una sola fila', () => {

    const records = [
      attendance({
        id: 's_a',
        studentUid: 'a',
        solved: true,
        rewardClaimed: true,
        rewardId: 'sp-001',
        attempts: 3,
        registeredAt: timestamp(
          new Date(2026, 8, 1, 9, 0)
        ) as any
      })
    ];

    const rows =
      buildStudentReportRows(records);

    expect(rows).toHaveLength(1);

    expect(rows[0]).toEqual({
      fecha: '01/09/2026 09:00',
      estado: 'Resolvió',
      cartas: 1
    });

  });

  it('ordena las filas por fecha', () => {

    const records = [
      attendance({
        studentUid: 'a',
        solved: true,
        rewardClaimed: true,
        rewardId: 'sp-001',
        registeredAt: timestamp(
          new Date(2026, 8, 2, 9, 0)
        ) as any
      }),
      attendance({
        studentUid: 'a',
        solved: true,
        rewardClaimed: true,
        rewardId: 'sp-002',
        registeredAt: timestamp(
          new Date(2026, 8, 1, 9, 0)
        ) as any
      })
    ];

    const rows =
      buildStudentReportRows(records);

    expect(rows[0].fecha).toBe('01/09/2026 09:00');

    expect(rows[1].fecha).toBe('02/09/2026 09:00');

  });

});

describe('filterStudents', () => {

  const students: User[] = [
    {
      uid: 'a',
      email: 'ana@udistrital.edu.co',
      firstName: 'Ana',
      lastName: 'García',
      role: UserRole.STUDENT,
      avatar: 1,
      createdAt: timestamp(new Date(2026, 8, 1)) as any,
      lastLogin: timestamp(new Date(2026, 8, 1)) as any
    },
    {
      uid: 'b',
      email: 'luis@example.com',
      firstName: 'Luis',
      lastName: 'Pérez',
      role: UserRole.STUDENT,
      avatar: 2,
      createdAt: timestamp(new Date(2026, 8, 1)) as any,
      lastLogin: timestamp(new Date(2026, 8, 1)) as any
    }
  ];

  it('devuelve todos los estudiantes sin término de búsqueda', () => {

    expect(
      filterStudents(students, '')
    ).toEqual(students);

  });

  it('filtra por nombre', () => {

    const result =
      filterStudents(students, 'ana');

    expect(result).toHaveLength(1);

    expect(result[0].uid).toBe('a');

  });

  it('filtra por correo electrónico', () => {

    const result =
      filterStudents(students, 'example.com');

    expect(result).toHaveLength(1);

    expect(result[0].uid).toBe('b');

  });

  it('ignora mayúsculas y espacios', () => {

    const result =
      filterStudents(students, '  LUIS ');

    expect(result).toHaveLength(1);

    expect(result[0].uid).toBe('b');

  });

  it('devuelve vacío cuando no hay coincidencias', () => {

    expect(
      filterStudents(students, 'zzz')
    ).toEqual([]);

  });

});

describe('RQ10 — sobre manual', () => {

  it('cuenta el sobre manual en el resumen por estudiante', () => {

    const record = attendance({
      studentUid: 'a',
      sessionId: 'manual_1',
      manual: true,
      solved: true,
      rewardClaimed: true,
      rewardId: 'sp-001'
    });

    const rows =
      buildStudentSummaryRows(
        [record],
        {
          a: {
            firstName: 'Ana',
            lastName: 'García',
            email: 'agarcia@udistrital.edu.co'
          }
        }
      );

    expect(rows[0].sobres).toBe(1);

  });

  it('marca el sobre manual como abierto en la exportación', () => {

    const record = attendance({
      studentUid: 'a',
      sessionId: 'manual_1',
      manual: true,
      solved: true,
      rewardClaimed: true,
      rewardId: 'sp-001',
      registeredAt: timestamp(
        new Date(2026, 8, 1, 9, 0)
      ) as any
    });

    const rows: AttendanceExportRow[] =
      buildExportRows(
        [record],
        {
          a: {
            firstName: 'Ana',
            lastName: 'García',
            email: 'agarcia@udistrital.edu.co'
          }
        }
      );

    expect(rows[0].abrioSobre).toBe('Sí');

    expect(rows[0].estudiante).toBe('Ana García');

  });

  it('reporta el sobre manual como Resolvió con una carta en el PDF', () => {

    const record = attendance({
      studentUid: 'a',
      sessionId: 'manual_1',
      manual: true,
      solved: true,
      rewardClaimed: true,
      rewardId: 'sp-001',
      registeredAt: timestamp(
        new Date(2026, 8, 1, 9, 0)
      ) as any
    });

    const rows =
      buildStudentReportRows([record]);

    expect(rows[0]).toEqual({
      fecha: '01/09/2026 09:00',
      estado: 'Resolvió',
      cartas: 1
    });

  });

});