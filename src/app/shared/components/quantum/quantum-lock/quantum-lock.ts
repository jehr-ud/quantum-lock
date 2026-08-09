import {
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';

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

  readonly interactive =
    input(false);

  readonly solved = output<void>();
  readonly failed = output<void>();

  readonly currentPositions =
    signal<QuantumDirection[]>([]);

  constructor() {

    effect(() => {

      const positions = this.lock().positions;

      this.currentPositions.set(

        positions.map(() => QuantumDirection.N)

      );

    });

    effect(() => {

      if (!this.interactive()) {

        return;

      }

      if (this.isSolved()) {

        this.solved.emit();

      }

    });

  }

  rotateClockwise(
    index: number
  ) {

    if (!this.interactive()) {

      return;

    }

    this.rotate(index, 1);

  }

  rotateCounterClockwise(
    index: number,
    event: MouseEvent
  ) {

    event.preventDefault();

    if (!this.interactive()) {

      return;

    }

    this.rotate(index, -1);

  }

  readonly rotations = computed(() => {

    const positions = this.interactive()

      ? this.currentPositions()

      : this.lock().positions;

    return positions.map(direction =>
      this.toRotation(direction)
    );

  });

  readonly isSolved = computed(() => {

    if (!this.interactive()) {

      return false;

    }

    return this.lock().positions.every(

      (direction, index) =>

        direction === this.currentPositions()[index]

    );

  });

  private rotate(
    index: number,
    step: number
  ) {

    const positions = [

      ...this.currentPositions()

    ];

    positions[index] = this.nextDirection(

      positions[index],

      step

    );

    this.currentPositions.set(positions);

  }

  private nextDirection(

    direction: QuantumDirection,

    step: number

  ): QuantumDirection {

    const directions = [

      QuantumDirection.N,
      QuantumDirection.NE,
      QuantumDirection.E,
      QuantumDirection.SE,
      QuantumDirection.S,
      QuantumDirection.SW,
      QuantumDirection.W,
      QuantumDirection.NW

    ];

    const current =

      directions.indexOf(direction);

    const next =

      (current + step + directions.length)

      % directions.length;

    return directions[next];

  }

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