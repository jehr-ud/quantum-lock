import { describe, it, expect } from 'vitest';

import { Attendance } from '../../models/attendance';
import { SessionStatus } from '../enums/session-status';

import {
  buildExportRows,
  computeRewardCounts,
  countDistinctStudents,
  formatExportDate,
  isSessionUsable,
  AttendanceExportRow
} from './domain';

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
      abrioSobre: 'Sí'
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