/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, LayoutGroup } from 'motion/react';
import { Card as CardComp } from './components/Card';
import { SuitSelector, GameOverModal } from './components/Modals';
import { Card, Suit, GameState, Rank, PlayerType } from './types';
import { createDeck, shuffle, canPlayCard, getAIAction, getBestSuitForAI } from './utils/gameLogic';
import { Hand, Layers, Info, RotateCcw, Volume2, VolumeX, Heart, Diamond, Club as ClubIcon, Spade } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    discardPile: [],
    playerHand: [],
    aiHand: [],
    currentPlayer: 'PLAYER',
    currentSuit: null,
    winner: null,
    isGameOver: false,
    status: 'DEALING',
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);

  // Initialize Game
  const initGame = useCallback(() => {
    const fullDeck = shuffle(createDeck());
    const initialPlayerHand = fullDeck.splice(0, 8);
    const initialAiHand = fullDeck.splice(0, 8);
    const firstDiscard = fullDeck.splice(0, 1)[0];
    
    setGameState({
      deck: fullDeck,
      discardPile: [firstDiscard],
      playerHand: initialPlayerHand,
      aiHand: initialAiHand,
      currentPlayer: 'PLAYER',
      currentSuit: firstDiscard.rank === Rank.EIGHT ? firstDiscard.suit : null,
      winner: null,
      isGameOver: false,
      status: 'PLAYING',
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // AI Turn Logic
  useEffect(() => {
    if (gameState.currentPlayer === 'AI' && !gameState.isGameOver && gameState.status === 'PLAYING') {
      const timer = setTimeout(() => {
        setAiThinking(true);
        const aiThinkTimer = setTimeout(() => {
          handleAITurn();
          setAiThinking(false);
        }, 1500);
        return () => clearTimeout(aiThinkTimer);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.isGameOver, gameState.status]);

  const handleAITurn = () => {
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const action = getAIAction(gameState.aiHand, topCard, gameState.currentSuit);

    if (action === 'DRAW') {
      drawCard('AI');
    } else {
      playCard('AI', action);
    }
  };

  const playCard = (player: PlayerType, card: Card) => {
    if (gameState.isGameOver) return;

    setGameState(prev => {
      const hand = player === 'PLAYER' ? prev.playerHand : prev.aiHand;
      const newHand = hand.filter(c => c.id !== card.id);
      const newDiscardPile = [...prev.discardPile, card];
      
      const isGameOver = newHand.length === 0;
      const status = (card.rank === Rank.EIGHT && !isGameOver) 
        ? (player === 'PLAYER' ? 'SELECTING_SUIT' : 'ANIMATING') 
        : 'PLAYING';

      // If AI plays an 8, it picks the best suit immediately
      let newCurrentSuit = card.rank === Rank.EIGHT ? null : null;
      if (card.rank === Rank.EIGHT && player === 'AI') {
        newCurrentSuit = getBestSuitForAI(newHand);
      }

      return {
        ...prev,
        [player === 'PLAYER' ? 'playerHand' : 'aiHand']: newHand,
        discardPile: newDiscardPile,
        currentSuit: newCurrentSuit,
        status: status === 'ANIMATING' ? 'PLAYING' : status,
        currentPlayer: status === 'SELECTING_SUIT' ? player : (player === 'PLAYER' ? 'AI' : 'PLAYER'),
        isGameOver,
        winner: isGameOver ? player : null,
      };
    });

    // If AI played 8, we just manually move turn in the state setter above
  };

  const drawCard = (player: PlayerType) => {
    if (gameState.deck.length === 0) {
      // Skip turn if deck empty
      setGameState(prev => ({
        ...prev,
        currentPlayer: player === 'PLAYER' ? 'AI' : 'PLAYER'
      }));
      return;
    }

    setGameState(prev => {
      const newDeck = [...prev.deck];
      const drawnCard = newDeck.pop()!;
      const hand = player === 'PLAYER' ? prev.playerHand : prev.aiHand;
      const newHand = [...hand, drawnCard];

      return {
        ...prev,
        deck: newDeck,
        [player === 'PLAYER' ? 'playerHand' : 'aiHand']: newHand,
        currentPlayer: player === 'PLAYER' ? 'AI' : 'PLAYER'
      };
    });
  };

  const handleSuitSelect = (suit: Suit) => {
    setGameState(prev => ({
      ...prev,
      currentSuit: suit,
      status: 'PLAYING',
      currentPlayer: 'AI'
    }));
  };

  const topCard = gameState.discardPile.length > 0 ? gameState.discardPile[gameState.discardPile.length - 1] : null;

  const SuitIndicator = useMemo(() => {
    if (!gameState.currentSuit) return null;
    const Icon = {
      [Suit.HEARTS]: Heart,
      [Suit.DIAMONDS]: Diamond,
      [Suit.CLUBS]: ClubIcon,
      [Suit.SPADES]: Spade,
    }[gameState.currentSuit];

    return (
      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
        <span className="text-sm font-medium text-white/80">当前花色:</span>
        <Icon className={`w-5 h-5 ${gameState.currentSuit === Suit.HEARTS || gameState.currentSuit === Suit.DIAMONDS ? 'text-rose-400' : 'text-slate-900'}`} />
      </div>
    );
  }, [gameState.currentSuit]);

  if (gameState.discardPile.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a472a] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-white/40 font-black text-2xl tracking-tighter"
        >
          L O A D I N G . . .
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#1a472a] overflow-hidden flex flex-col font-sans select-none">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#ffffff_1px,_transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Header UI - Player Stats */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
        {/* Left Top: AI Player */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`pointer-events-auto flex items-center gap-4 p-4 rounded-3xl backdrop-blur-xl border transition-all ${
            gameState.currentPlayer === 'AI' 
              ? 'bg-white/20 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
              : 'bg-black/20 border-white/5'
          }`}
        >
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
              gameState.currentPlayer === 'AI' ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50' : 'bg-slate-700'
            }`}>
              <div className="relative">
                <span className="font-black text-xl">AI</span>
                {aiThinking && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-white/60 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Opponent</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg leading-none">疯狂电脑</span>
              <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg border border-white/5">
                <Layers size={10} className="text-indigo-400" />
                <span className="text-white text-xs font-bold">{gameState.aiHand.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center: Game Title (Smaller/Floating) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center pointer-events-auto">
          <h1 className="text-white font-black text-xl tracking-tighter flex items-center gap-2">
            EASON 疯狂 8 点
          </h1>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button 
              onClick={initGame}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Right Top: Human Player */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`pointer-events-auto flex items-center gap-4 p-4 rounded-3xl backdrop-blur-xl border transition-all text-right ${
            gameState.currentPlayer === 'PLAYER' 
              ? 'bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
              : 'bg-black/20 border-white/5'
          }`}
        >
          <div className="flex flex-col items-end">
            <span className="text-white/60 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Player</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg border border-white/5 order-2">
                <Layers size={10} className="text-emerald-400" />
                <span className="text-white text-xs font-bold">{gameState.playerHand.length}</span>
              </div>
              <span className="text-white font-bold text-lg leading-none order-1">你</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
            gameState.currentPlayer === 'PLAYER' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-700'
          }`}>
            <span className="font-black text-xl text-center">ME</span>
          </div>
        </motion.div>
      </div>

      <LayoutGroup>
        {/* Play Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 gap-12 mt-16 mb-24">
          
          {/* AI Hand (Top) */}
          <div className="relative flex flex-col items-center gap-4">
            <div className="flex justify-center -space-x-12 px-12">
              {gameState.aiHand.map((card, i) => (
                <CardComp 
                  key={card.id} 
                  card={card} 
                  isFaceUp={false}
                  className="rotate-[-2deg]"
                />
              ))}
              {gameState.aiHand.length === 0 && <div className="h-36 w-24"></div>}
            </div>
            {aiThinking && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full border border-white/10"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Center Table */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
            {/* Draw Pile */}
            <div className="relative group flex flex-col items-center gap-2">
              <div 
                onClick={() => gameState.currentPlayer === 'PLAYER' && drawCard('PLAYER')}
                className={`relative cursor-pointer transition-transform ${gameState.currentPlayer === 'PLAYER' ? 'hover:scale-105 active:scale-95' : 'opacity-80'}`}
              >
                {/* Visual Deck Stack */}
                <div className="absolute top-1 left-1 w-24 h-36 bg-indigo-950/20 rounded-xl"></div>
                <div className="absolute top-0.5 left-0.5 w-24 h-36 bg-indigo-900 rounded-xl border-2 border-indigo-700/50"></div>
                {gameState.deck.length > 0 && (
                  <CardComp 
                    card={gameState.deck[gameState.deck.length - 1]} 
                    isFaceUp={false} 
                    className={gameState.currentPlayer === 'PLAYER' ? 'ring-4 ring-white/0 group-hover:ring-white/20 transition-all shadow-2xl' : ''}
                  />
                )}
                {gameState.deck.length === 0 && (
                  <div className="w-24 h-36 bg-black/20 rounded-xl border-2 border-white/10 flex items-center justify-center text-white/20 font-bold text-xs uppercase tracking-tighter">
                    空
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-indigo-200/60 font-black text-xl">{gameState.deck.length}</span>
                </div>
              </div>
              <span className="text-green-200/40 text-[10px] uppercase font-bold tracking-widest">摸牌堆</span>
            </div>

            {/* Discard Pile */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                {/* Fan out last 2 cards slightly */}
                {gameState.discardPile.length > 1 && (
                  <CardComp 
                    card={gameState.discardPile[gameState.discardPile.length - 2]} 
                    className="absolute top-0 left-0 rotate-[-5deg] opacity-50 scale-95" 
                  />
                )}
                {topCard && (
                  <CardComp 
                    card={topCard} 
                    isLarge 
                    className="shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10" 
                  />
                )}
              </div>
              {SuitIndicator}
            </div>
          </div>

          {/* Player Hand (Bottom) */}
          <div className="w-full max-w-6xl">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 px-4 overflow-visible pb-12">
              {gameState.playerHand.map((card) => (
                <CardComp
                  key={card.id}
                  card={card}
                  isPlayable={gameState.currentPlayer === 'PLAYER' && topCard ? canPlayCard(card, topCard, gameState.currentSuit) : false}
                  onClick={() => playCard('PLAYER', card)}
                />
              ))}
            </div>
          </div>
        </main>
      </LayoutGroup>

      {/* Footer Info */}
      <div className="p-6 flex justify-between items-center bg-black/10 backdrop-blur-md border-t border-white/5">
        <div className="flex items-center gap-6 text-green-100/50 text-xs">
          <div className="flex items-center gap-2">
            <Hand size={14} />
            <span>手牌: {gameState.playerHand.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers size={14} />
            <span>剩余: {gameState.deck.length}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
            gameState.currentPlayer === 'PLAYER' 
              ? 'bg-white text-green-900 border-white shadow-lg' 
              : 'bg-white/5 text-white/40 border-white/10'
          }`}>
            Your Turn
          </div>
          <button className="text-white/40 hover:text-white transition-colors">
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <SuitSelector 
        isOpen={gameState.status === 'SELECTING_SUIT'} 
        onSelect={handleSuitSelect} 
      />
      <GameOverModal 
        isOpen={gameState.isGameOver} 
        winner={gameState.winner} 
        onRestart={initGame} 
      />
    </div>
  );
}
