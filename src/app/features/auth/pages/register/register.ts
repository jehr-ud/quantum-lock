import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UserRole } from '../../../../core/enums/user-role';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');

  readonly loading = signal(false);
  readonly error = signal('');

  async register() {

    this.error.set('');

    const email = this.email().trim().toLowerCase();

    if (!email.endsWith('@udistrital.edu.co')) {

      this.error.set(
        'Debes utilizar un correo institucional.'
      );

      return;

    }

    if (this.password().length < 6) {

      this.error.set(
        'La contraseña debe tener al menos 6 caracteres.'
      );

      return;

    }

    if (this.password() !== this.confirmPassword()) {

      this.error.set(
        'Las contraseñas no coinciden.'
      );

      return;

    }

    this.loading.set(true);

    try {

      const user = await this.auth.register(
        this.firstName(),
        this.lastName(),
        email,
        this.password()
      );

      if (user.role === UserRole.TEACHER) {

        await this.router.navigate(['/teacher/dashboard']);

      } else {

        await this.router.navigate(['/student/dashboard']);

      }

    } catch (e: any) {

      this.error.set(
        e.message ?? 'No fue posible crear la cuenta.'
      );

    } finally {

      this.loading.set(false);

    }

  }

}