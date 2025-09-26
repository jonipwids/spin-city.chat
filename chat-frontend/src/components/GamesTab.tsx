'use client';

import { useState } from 'react';
import { GameTransaction } from '@/types';

interface GamesTabProps {
  games: GameTransaction[];
}

export default function GamesTab({ games }: GamesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProfitLoss = (betAmount: number, winAmount: number) => {
    return winAmount - betAmount;
  };

  const filteredGames = games.filter(game => 
    game.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.gameId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.betAmount.toString().includes(searchTerm) ||
    game.winAmount.toString().includes(searchTerm)
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-input text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-1.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 border border-border"
            />
            <svg className="absolute left-3 top-2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Excel-style Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="border-b border-border">
                <tr className="bg-muted">
                  <th className="border-r border-border px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">Game</th>
                  <th className="border-r border-border px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">Bet Amount</th>
                  <th className="border-r border-border px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">Win Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">Profit/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGames.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No games found
                    </td>
                  </tr>
                ) : (
                  filteredGames.map((game) => {
                    const profitLoss = getProfitLoss(game.betAmount, game.winAmount);
                    
                    return (
                      <tr key={game.id} className="hover:bg-accent/50">
                        <td className="border-r border-border px-4 py-3 text-sm text-card-foreground">
                          <div>
                            <div className="font-medium font-sans">{game.gameName}</div>
                            <div className="text-xs text-muted-foreground font-sans">ID: {game.gameId}</div>
                          </div>
                        </td>
                        <td className="border-r border-border px-4 py-3 text-sm font-mono text-card-foreground">
                          {formatCurrency(game.betAmount)}
                        </td>
                        <td className="border-r border-border px-4 py-3 text-sm font-mono text-card-foreground">
                          {formatCurrency(game.winAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-card-foreground">
                          {profitLoss > 0 ? '+' : ''}{formatCurrency(profitLoss)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}