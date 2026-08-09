
import { RewardRarity } from '../../app/core/enums/reward-rarity';

export interface Reward {

  id: string;

  title: string;

  emoji: string;

  description: string;

  rarity: RewardRarity;

}