/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Suit {
  HEARTS = 'HEARTS',
  DIAMONDS = 'DIAMONDS',
  CLUBS = 'CLUBS',
  SPADES = 'SPADES',
}

export enum Rank {
  ACE = 'A',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
}

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type PlayerType = 'PLAYER' | 'AI';

export interface GameState {
  deck: Card[];
  discardPile: Card[];
  playerHand: Card[];
  aiHand: Card[];
  currentPlayer: PlayerType;
  currentSuit: Suit | null; // For the '8' wild card
  winner: PlayerType | null;
  isGameOver: boolean;
  status: 'DEALING' | 'PLAYING' | 'SELECTING_SUIT' | 'ANIMATING';
}
