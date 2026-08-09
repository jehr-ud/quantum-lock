import { Component, input, output } from '@angular/core';

import { Course } from '../../../../models/course';
import { CourseCard } from '../course-card/course-card';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CourseCard
  ],
  templateUrl: './course-list.html',
  styleUrl: './course-list.scss'
})
export class CourseList {

  readonly courses =
    input.required<Course[]>();

  readonly actionText =
    input('Entrar');

  readonly action =
    output<Course>();

  readonly secondaryActionText =
    input<string | null>(null);

  readonly secondaryAction =
    output<Course>();

}