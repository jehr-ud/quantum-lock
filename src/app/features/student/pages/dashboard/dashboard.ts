import {
  Component,
  inject,
  signal
} from '@angular/core';
import { Router } from '@angular/router';

import { CourseHeader } from '../../../../shared/components/course/course-header/course-header';
import { CourseList } from '../../../../shared/components/course/course-list/course-list';

import { Course } from '../../../../models/course';

import { CourseService } from '../../../../core/services/course.service';
import { ClassSessionService } from '../../../../core/services/class-session.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CourseHeader,
    CourseList
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  private readonly router =
    inject(Router);

  private readonly auth =
    inject(AuthService);

  private readonly courseService =
    inject(CourseService);

  private readonly sessionService =
    inject(ClassSessionService);

  readonly courses =
    this.courseService.courses;

  /**
   * RQ07 — Estado de la acción de cerrar sesión.
   */
  readonly logouting = signal(false);
  readonly logoutError = signal('');

  /**
   * RQ07 — Cierra la sesión de Firebase Authentication
   * y redirige al login. No modifica datos de la
   * aplicación.
   */
  async logout() {

    if (this.logouting()) {

      return;

    }

    this.logouting.set(true);

    this.logoutError.set('');

    try {

      await this.auth.signOut();

      await this.router.navigate([

        '/login'

      ]);

    } catch (error) {

      console.error(
        'Error cerrando sesión:',
        error
      );

      this.logoutError.set(
        'No fue posible cerrar la sesión. Inténtalo nuevamente.'
      );

    } finally {

      this.logouting.set(false);

    }

  }


  async openCourse(
    course: Course
  ) {

    await this.router.navigate([
      '/student/session',
      course.id
    ]);

  }

  openAlbum(course: Course) {
    this.router.navigate([

        '/student/album',

        course.id

    ]);

  }

}