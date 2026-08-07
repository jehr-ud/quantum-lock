import { AppConfiguration } from '../../models/app-config';

export const SEED = {

  courses: [

    {
      id: '1542-301',
      code: '1542',
      name: 'Programación por Componentes'
    },

    {
      id: '1542-303',
      code: '1542',
      name: 'Programación por Componentes'
    },

    {
      id: '1532-302',
      code: '1532',
      name: 'Inteligencia Artificial'
    }

  ],

  config: <AppConfiguration>{

    sessionDurationSeconds: 30,

    quantumLockSize: 5,

    maxAttempts: 3

  }

};