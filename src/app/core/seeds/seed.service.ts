import { Injectable } from '@angular/core';

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc

} from 'firebase/firestore';

import {
    createUserWithEmailAndPassword
} from 'firebase/auth';

import {
    auth,
    firestore
} from '../firebase/firebase';

import { Collections } from '../constants/firestore.collections';
import { SEED } from './seed.data';

@Injectable({

    providedIn: 'root'

})

export class SeedService {

    async seedEverything() {

        console.log("🌱 Running seeds...");

        await this.seedCourses();
        await this.seedConfig();

        console.log("✅ Seeds completed");

    }


    async seedCourses() {

        console.log('Iniciando seed de cursos');

        for (const course of SEED.courses) {

            console.log('Procesando', course);

            try {

                const ref = doc(firestore, Collections.COURSES, course.id);

                const snapshot = await getDoc(ref);

                console.log('Existe:', snapshot.exists());

                if (snapshot.exists()) {

                    const data = snapshot.data();

                    if (!data?.['schedule']) {

                        await setDoc(
                            ref,
                            {
                                schedule: course.schedule
                            },
                            { merge: true }
                        );

                        console.log('Horario actualizado:', course.id);

                    }

                    continue;
                }

                await setDoc(ref, course);

                console.log('Curso creado:', course.id);

            } catch (e) {

                console.error('Error creando curso', course.id, e);

            }
        }

        console.log('Seed finalizado');
    }

    async seedConfig() {

        console.log('Iniciando seed de configuración');

        try {

            const ref = doc(

                firestore,

                Collections.SETTINGS,

                'application'

            );

            const snapshot = await getDoc(ref);

            console.log('Existe:', snapshot.exists());

            await setDoc(

                ref,

                SEED.config,

                { merge: true }

            );

            console.log('Configuración sincronizada');

        } catch (e) {

            console.error(

                'Error creando configuración',

                e

            );

        }

    }

}