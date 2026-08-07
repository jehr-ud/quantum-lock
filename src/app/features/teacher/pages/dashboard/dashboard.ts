import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CourseService } from '../../../../core/services/course.service';
import { ClassSessionService } from '../../../../core/services/class-session.service';
import { CourseHeader } from '../../../../shared/components/course/course-header/course-header';
import { CourseList } from '../../../../shared/components/course/course-list/course-list';
import { Course } from '../../../../models/course';
import { AuthService } from '../../../../core/services/auth.service';
import { ClassSession } from '../../../../models/class-session';
import { SessionCreatedDialog } from '../../../../shared/components/session/session-created-dialog/session-created-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CourseHeader,
    CourseList,
    SessionCreatedDialog
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  private readonly courseService = inject(CourseService);
  private readonly auth = inject(AuthService);
  private readonly sessionService = inject(ClassSessionService);

  private readonly router = inject(Router);
  readonly courses = this.courseService.courses;
  sessionCreated = signal<ClassSession | null>(null);

async startSession(course: Course) {

  const user = this.auth.currentUser();

  if (!user) {
    return;
  }

  const session = await this.sessionService.createSession(
    course.id,
    user.uid
  );

  this.sessionCreated.set(session);

}

enterSession() {

  const session = this.sessionCreated();

  if (!session) {
    return;
  }

  this.router.navigate([
    '/teacher/session',
    session.id
  ]);

}

closeDialog() {

  this.sessionCreated.set(null);

}

}