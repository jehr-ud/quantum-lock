import {
  Component,
  computed,
  input,
  signal
} from '@angular/core';

@Component({
  selector: 'app-reward-card',
  standalone: true,
  imports: [],
  templateUrl: './reward-card.html',
  styleUrl: './reward-card.scss'
})
export class RewardCard {

  readonly title =
    input.required<string>();

  readonly emoji =
    input.required<string>();

  readonly rarity =
    input('Common');

  readonly flipped =
    signal(false);

  readonly rarityColor =
    computed(() => {

      switch (this.rarity()) {

        case 'Legendary':
          return '#f59e0b';

        case 'Epic':
          return '#8b5cf6';

        case 'Rare':
          return '#2563eb';

        default:
          return '#16a34a';

      }

    });

  flip() {

    this.flipped.set(true);

  }

}