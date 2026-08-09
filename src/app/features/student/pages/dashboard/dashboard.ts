import {
  Component,
  inject
} from '@angular/core';
import { Router } from '@angular/router';

import { CourseHeader } from '../../../../shared/components/course/course-header/course-header';
import { CourseList } from '../../../../shared/components/course/course-list/course-list';

import { Course } from '../../../../models/course';

import { CourseService } from '../../../../core/services/course.service';
import { ClassSessionService } from '../../../../core/services/class-session.service';

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

  private readonly courseService =
    inject(CourseService);

  private readonly sessionService =
    inject(ClassSessionService);

  readonly courses =
    this.courseService.courses;


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