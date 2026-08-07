import { Component, computed, input } from '@angular/core';

import { QuantumLock as QuantumLockModel } from '../../../../models/quantum-lock';
import { QuantumDirection } from '../../../../core/enums/quantum-direction';

@Component({
  selector: 'app-quantum-lock',
  standalone: true,
  imports: [],
  templateUrl: './quantum-lock.html',
  styleUrl: './quantum-lock.scss'
})
export class QuantumLock {

  readonly lock =
    input.required<QuantumLockModel>();

  readonly rotations = computed(() =>

    this.lock().positions.map(direction =>
      this.toRotation(direction)
    )

  );

  private toRotation(
    direction: QuantumDirection
  ): number {

    switch (direction) {

      case QuantumDirection.N:
        return 0;

      case QuantumDirection.NE:
        return 45;

      case QuantumDirection.E:
        return 90;

      case QuantumDirection.SE:
        return 135;

      case QuantumDirection.S:
        return 180;

      case QuantumDirection.SW:
        return 225;

      case QuantumDirection.W:
        return 270;

      case QuantumDirection.NW:
        return 315;

      default:
        return 0;

    }

  }

}