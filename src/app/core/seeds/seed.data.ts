import { AppConfiguration } from '../../models/app-config';

export const SEED = {

  courses: [

    {
      id: '1542-301',
      code: '1542',
      name: 'Programación por Componentes',
      schedule: [
        { day: 1, start: '12:00', end: '14:00' },
        { day: 3, start: '14:00', end: '16:00' }
      ]
    },

    {
      id: '1542-303',
      code: '1542',
      name: 'Programación por Componentes',
      schedule: [
        { day: 1, start: '08:00', end: '10:15' },
        { day: 3, start: '08:00', end: '10:15'  }
      ]
    },

    {
      id: '1532-302',
      code: '1532',
      name: 'Inteligencia Artificial',
      schedule: [
        { day: 1, start: '14:00', end: '16:00' },
        { day: 3, start: '10:00', end: '12:00' }
      ]
    }

  ],

  config: <AppConfiguration>{

    sessionDurationSeconds: 30,

    quantumLockSize: 5,

    maxAttempts: 3

  }

};