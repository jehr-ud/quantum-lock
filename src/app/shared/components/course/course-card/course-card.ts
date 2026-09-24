import { Component, input, output } from '@angular/core';

import { Course } from '../../../../models/course';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [],
  templateUrl: './course-card.html',
  styleUrl: './course-card.scss'
})
export class CourseCard {

  readonly course = input.required<Course>();

  readonly actionText = input('Entrar');

  readonly action = output<Course>();

  readonly secondaryActionText =
    input<string | null>(null);

  readonly secondaryAction =
    output<Course>();

  readonly tertiaryActionText =
    input<string | null>(null);

  readonly tertiaryAction =
    output<Course>();

  onAction(): void {

    this.action.emit(this.course());

  }

}