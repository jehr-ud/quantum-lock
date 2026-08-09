import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { AttendanceService } from '../../../../core/services/attendance.service';

import { REWARD_CARDS } from '../../../../shared/data/reward-cards';

import { RewardRarity } from '../../../../core/enums/reward-rarity';

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './album.html',
  styleUrl: './album.scss'
})
export class Album {

  private readonly route = inject(ActivatedRoute);

  readonly courseId = this.route.snapshot.paramMap.get('courseId');

  private readonly auth =
    inject(AuthService);

  private readonly attendanceService =
    inject(AttendanceService);

  readonly loading =
    signal(true);

  readonly error =
    signal('');


  readonly rewardCounts =
    signal<Record<string, number>>({});


  readonly cards =
    computed(() => {

      const counts =
        this.rewardCounts();

      return REWARD_CARDS.map(card => {

        const quantity =
          counts[card.id] ?? 0;

        return {

          ...card,

          quantity,

          collected:
            quantity > 0

        };

      });

    });


  readonly collectedCount =
    computed(() => {

      return this.cards()
        .filter(
          card => card.collected
        )
        .length;

    });

  readonly totalCards =
    computed(() => {

      return REWARD_CARDS.length;

    });



  readonly totalObtained =
    computed(() => {

      return Object.values(
        this.rewardCounts()
      ).reduce(

        (total, quantity) =>
          total + quantity,

        0

      );

    });

  readonly progress =
    computed(() => {

      const total =
        this.totalCards();

      if (!total) {

        return 0;

      }

      return Math.round(

        (
          this.collectedCount()
          / total
        ) * 100

      );

    });

  readonly commonCount =
    computed(() =>
      this.countByRarity(
        RewardRarity.COMMON
      )
    );

  readonly rareCount =
    computed(() =>
      this.countByRarity(
        RewardRarity.RARE
      )
    );

  readonly epicCount =
    computed(() =>
      this.countByRarity(
        RewardRarity.EPIC
      )
    );

  readonly legendaryCount =
    computed(() =>
      this.countByRarity(
        RewardRarity.LEGENDARY
      )
    );


  constructor() {

    this.load();

  }

  async load() {

    try {

      if (!this.courseId) {

        this.error.set(
          'No se especificó el curso.'
        );

        return;

      }


      const user =
        this.auth.currentUser();

      if (!user) {

        this.error.set(
          'No se encontró el usuario.'
        );

        return;

      }


      const counts =
        await this.attendanceService
          .getStudentRewardCounts(
            user.uid,
            this.courseId!
          );


      this.rewardCounts.set(
        counts
      );

    } catch (error) {

      console.error(
        'Error cargando álbum:',
        error
      );

      this.error.set(
        'No fue posible cargar tu álbum.'
      );

    } finally {

      this.loading.set(false);

    }

  }

  private countByRarity(
    rarity: RewardRarity
  ) {

    const cards =
      this.cards().filter(
        card =>
          card.rarity === rarity
      );


    const collected =
      cards.filter(
        card =>
          card.collected
      );


    return {

      collected:
        collected.length,

      total:
        cards.length

    };

  }

}