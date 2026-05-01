/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { Heart, Diamond, Club, Spade, Trophy, RotateCcw } from 'lucide-react';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
  isOpen: boolean;
}

export const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect, isOpen }) => {
  const suits = [
    { type: Suit.HEARTS, icon: Heart, color: 'text-rose-500', name: '红心' },
    { type: Suit.DIAMONDS, icon: Diamond, color: 'text-rose-500', name: '方块' },
    { type: Suit.CLUBS, icon: Club, color: 'text-slate-900', name: '梅花' },
    { type: Suit.SPADES, icon: Spade, color: 'text-slate-900', name: '黑桃' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-800">万能 8 点！选择一个花色</h2>
            <div className="grid grid-cols-2 gap-4">
              {suits.map((suit) => (
                <button
                  key={suit.type}
                  onClick={() => onSelect(suit.type)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <suit.icon className={`${suit.color} w-12 h-12 mb-2 group-hover:scale-110 transition-transform`} />
                  <span className="font-medium text-slate-600">{suit.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface GameOverModalProps {
  winner: 'PLAYER' | 'AI' | null;
  onRestart: () => void;
  isOpen: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onRestart, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-yellow-100 rounded-full">
                <Trophy className="w-16 h-16 text-yellow-600" />
              </div>
            </div>
            
            <h2 className="text-4xl font-extrabold mb-4 text-slate-900">
              {winner === 'PLAYER' ? '你赢了！' : 'AI 赢了'}
            </h2>
            <p className="text-slate-500 mb-8 text-lg">
              {winner === 'PLAYER' ? '太棒了，你清空了所有的手牌！' : '别灰心，下次一定能赢！'}
            </p>

            <button
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-colors shadow-lg shadow-indigo-200"
            >
              <RotateCcw className="w-6 h-6" />
              重新开始
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
