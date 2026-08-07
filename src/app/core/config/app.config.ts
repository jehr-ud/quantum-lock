import { UserRole } from '../enums/user-role';

export const AppConfig = {

    admins: [

        {
            email: 'jehernandezr@udistrital.edu.co',
            role: UserRole.TEACHER
        }

    ],

    allowedDomains: [
        'udistrital.edu.co'
    ]

};