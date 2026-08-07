import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AppConfig } from '../../../../core/config/app.config';
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
  readonly username = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly defaultDomain = AppConfig.allowedDomains[0];
  
  readonly loading = signal(false);
  readonly error = signal('');

  readonly email = computed(() => {

    const username = this.username().trim().toLowerCase();

    return username
      ? `${username}@${this.defaultDomain}`
      : '';

  });


  async register() {

    this.error.set('');

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
        this.email(),
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