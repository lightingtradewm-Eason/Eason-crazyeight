/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, Rank, Suit } from '../types';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
  const ranks = [
    Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, 
    Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, 
    Rank.JACK, Rank.QUEEN, Rank.KING
  ];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
      });
    }
  }
  return deck;
};

export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const canPlayCard = (card: Card, topCard: Card, currentSuit: Suit | null): boolean => {
  // 8 is wild
  if (card.rank === Rank.EIGHT) return true;

  // If top card is an 8, check against the declared suit
  if (topCard.rank === Rank.EIGHT) {
    return card.suit === currentSuit;
  }

  // Normal match
  return card.suit === topCard.suit || card.rank === topCard.rank;
};

export const getAIAction = (hand: Card[], topCard: Card, currentSuit: Suit | null): Card | 'DRAW' => {
  // Find playable cards
  const playable = hand.filter(card => canPlayCard(card, topCard, currentSuit));
  
  if (playable.length > 0) {
    // Strategy: Play an 8 if it's the only option or if we want to change suit, 
    // otherwise play normal cards first.
    const nonEight = playable.filter(c => c.rank !== Rank.EIGHT);
    if (nonEight.length > 0) {
      // Pick random non-eight for variety
      return nonEight[Math.floor(Math.random() * nonEight.length)];
    }
    // Only have eights
    return playable[0];
  }

  return 'DRAW';
};

export const getBestSuitForAI = (hand: Card[]): Suit => {
  const counts: Record<Suit, number> = {
    [Suit.HEARTS]: 0,
    [Suit.DIAMONDS]: 0,
    [Suit.CLUBS]: 0,
    [Suit.SPADES]: 0,
  };

  hand.forEach(c => {
    counts[c.suit]++;
  });

  return (Object.keys(counts) as Suit[]).reduce((a, b) => counts[a] > counts[b] ? a : b);
};
