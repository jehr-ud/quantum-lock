import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

import { AppConfig } from '../../../../core/config/app.config';
import { UserRole } from '../../../../core/enums/user-role';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly username = signal('');
  readonly defaultDomain = AppConfig.allowedDomains[0];

  email = signal('');
  password = signal('');

  loading = signal(false);

  error = signal('');

  async continue() {

    this.error.set('');

    const email = `${this.username().trim()}@${AppConfig.allowedDomains[0]}`;

    if (!email.endsWith('@udistrital.edu.co')) {

      this.error.set(
        'Debes utilizar tu correo institucional.'
      );

      return;

    }

    if (this.password().length < 6) {

      this.error.set(
        'La contraseña debe tener al menos 6 caracteres.'
      );

      return;

    }

    this.loading.set(true);

    try {

      const user = await this.auth.login(
        email,
        this.password()
      );

      switch (user.role) {

        case UserRole.TEACHER:
          await this.router.navigate(['/teacher']);
          break;

        case UserRole.STUDENT:
          await this.router.navigate(['/student']);
          break;

        default:
          this.error.set('Rol de usuario no válido.');
      }


    } catch (e: any) {

      console.error(e);

      this.error.set(
        e.message ?? 'Ocurrió un error.'
      );

    } finally {

      this.loading.set(false);

    }

  }

  goToRegister(): void {

  this.router.navigate(['/register']);

}

}