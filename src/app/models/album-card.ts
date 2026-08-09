import { Reward } from './reward';

export interface AlbumCard extends Reward {

  quantity: number;

  collected: boolean;

}