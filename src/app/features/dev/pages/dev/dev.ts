import { Component, inject, signal } from '@angular/core';

import { SeedService } from '../../../../core/seeds/seed.service';

@Component({
  selector: 'app-dev',
  standalone: true,
  imports: [],
  templateUrl: './dev.html',
  styleUrl: './dev.scss',
})
export class Dev {

  private readonly seedService = inject(SeedService);

  readonly loading = signal(false);

  async seedCourses() {

    this.loading.set(true);

    try {

      await this.seedService.seedCourses();

      alert('Cursos creados correctamente.');

    } finally {

      this.loading.set(false);

    }

  }

  async seedConfig() {

    this.loading.set(true);

    try {

      await this.seedService.seedConfig();

      alert('Configuración creada.');

    } finally {

      this.loading.set(false);

    }

  }

  async seedEverything() {

    this.loading.set(true);

    try {

      await this.seedService.seedEverything();

      alert('Seeds ejecutados.');

    } finally {

      this.loading.set(false);

    }

  }

}