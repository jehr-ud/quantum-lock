import { Component, input } from '@angular/core';

@Component({
  selector: 'app-course-header',
  standalone: true,
  imports: [],
  templateUrl: './course-header.html',
  styleUrl: './course-header.scss'
})
export class CourseHeader {

  readonly title = input('Mis cursos');

  readonly subtitle = input(
    'Selecciona un curso para iniciar una nueva sesión.'
  );

}