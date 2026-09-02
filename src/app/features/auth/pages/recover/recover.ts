import {
  Component,
  inject,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AppConfig } from '../../../../core/config/app.config';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './recover.html',
  styleUrl: './recover.scss'
})
export class Recover {

  private readonly auth =
    inject(AuthService);

  readonly defaultDomain =
    AppConfig.allowedDomains[0];

  readonly username =
    signal('');

  readonly loading =
    signal(false);

  readonly success =
    signal(false);

  readonly recoveryEmail =
    signal('');

  readonly error =
    signal('');

  async recover() {

    this.error.set('');

    this.success.set(false);

    const email =
      `${this.username().trim()}@${this.defaultDomain}`;

    if (!this.username().trim()) {

      this.error.set(
        'Debes ingresar tu usuario institucional.'
      );

      return;

    }

    if (!email.endsWith(`@${this.defaultDomain}`)) {

      this.error.set(
        'Debes utilizar tu correo institucional.'
      );

      return;

    }

    this.loading.set(true);

    try {

      await this.auth.sendPasswordReset(
        email
      );

      this.recoveryEmail.set(email);

      this.success.set(true);

      this.username.set('');

    } catch (error) {

      console.error(error);

      this.error.set(
        this.toUserMessage(error)
      );

    } finally {

      this.loading.set(false);

    }

  }

  private toUserMessage(
    error: unknown
  ): string {

    const code =
      (error as { code?: string })?.code ?? '';

    switch (code) {

      case 'auth/user-not-found':
        return 'Si el correo institucional está registrado, recibirás las instrucciones para restablecer tu contraseña.';

      case 'auth/invalid-email':
        return 'El correo institucional no es válido.';

      case 'auth/network-request-failed':
        return 'Hubo un problema de conexión. Inténtalo nuevamente.';

      default:
        return 'No fue posible enviar el correo de recuperación. Inténtalo nuevamente.';

    }

  }

}