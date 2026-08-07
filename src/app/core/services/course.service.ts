import { Injectable, signal } from '@angular/core';

import {
  collection,
  onSnapshot
} from 'firebase/firestore';

import { firestore } from '../firebase/firebase';
import { Collections } from '../constants/firestore.collections';

import { Course } from '../../models/course';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  readonly courses = signal<Course[]>([]);

  constructor() {
    this.loadCourses();
  }

  private loadCourses(): void {

    const ref = collection(
      firestore,
      Collections.COURSES
    );

    onSnapshot(ref, snapshot => {

      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];

      this.courses.set(courses);

    });

  }

}