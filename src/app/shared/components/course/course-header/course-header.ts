import {
  Component,
  input,
  output
} from '@angular/core';

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

  /**
   * RQ07 — Capacidad opcional para mostrar la acción
   * de cerrar sesión. No altera el comportamiento
   * existente cuando no se utiliza.
   */
  readonly showLogout = input(false);

  readonly logouting = input(false);

  readonly logout = output<void>();

}