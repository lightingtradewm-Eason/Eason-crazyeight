/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card as CardType, Suit } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isFaceUp?: boolean;
  isPlayable?: boolean;
  className?: string;
  isLarge?: boolean;
}

const SuitIcon = ({ suit, className }: { suit: Suit; className?: string }) => {
  switch (suit) {
    case Suit.HEARTS: return <Heart className={`fill-rose-500 text-rose-500 ${className}`} />;
    case Suit.DIAMONDS: return <Diamond className={`fill-rose-500 text-rose-500 ${className}`} />;
    case Suit.CLUBS: return <Club className={`fill-slate-800 text-slate-800 ${className}`} />;
    case Suit.SPADES: return <Spade className={`fill-slate-800 text-slate-800 ${className}`} />;
  }
};

export const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  isFaceUp = true, 
  isPlayable = false,
  className = '',
  isLarge = false
}) => {
  if (!card) return null;

  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
  const sizeClass = isLarge ? 'w-32 h-44' : 'w-24 h-36';

  return (
    <motion.div
      layoutId={card.id}
      whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`relative ${sizeClass} rounded-xl border-2 shadow-lg cursor-pointer transition-colors duration-200 ${
        isFaceUp ? 'bg-white' : 'bg-indigo-900 border-indigo-700 shadow-xl'
      } ${isPlayable ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-slate-200'} ${className}`}
    >
      <AnimatePresence mode="wait">
        {isFaceUp ? (
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full p-2 flex flex-col justify-between"
          >
            {/* Top Left */}
            <div className={`flex flex-col items-start leading-none ${isRed ? 'text-rose-500' : 'text-slate-900'}`}>
              <span className="font-bold text-xl leading-none">{card.rank}</span>
              <SuitIcon suit={card.suit} className="w-4 h-4 mt-1" />
            </div>

            {/* Center */}
            <div className="flex-1 flex items-center justify-center">
              <SuitIcon suit={card.suit} className={`${isLarge ? 'w-16 h-16' : 'w-12 h-12'} opacity-10`} />
            </div>

            {/* Bottom Right */}
            <div className={`flex flex-col items-start leading-none self-end rotate-180 ${isRed ? 'text-rose-500' : 'text-slate-900'}`}>
              <span className="font-bold text-xl leading-none">{card.rank}</span>
              <SuitIcon suit={card.suit} className="w-4 h-4 mt-1" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center p-2"
          >
            <div className="w-full h-full border-2 border-indigo-100/20 rounded-lg flex items-center justify-center overflow-hidden">
               {/* Decorative patterns for card back */}
              <div className="grid grid-cols-4 gap-1 opacity-20">
                {Array.from({ length: 16 }).map((_, i) => (
                   <div key={i} className="w-2 h-2 rounded-full bg-white" />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
