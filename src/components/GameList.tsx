import React from 'react';
import type { Game } from '../models/Game';
import { Pencil, Trash2, Wifi, Package } from 'lucide-react';

interface GameListProps {
  games: Game[];
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
}

const getRatingColor = (rating: number): string => {
  if (rating >= 8) return 'bg-green-100 text-green-800';
  if (rating >= 5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const GameList: React.FC<GameListProps> = ({ games, onEdit, onDelete }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg font-medium">No games in your collection yet.</p>
        <p className="text-sm mt-1">Add a game using the form above!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {games.map((game) => (
        <li
          key={game.id}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-800 truncate">{game.title}</h3>
              <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5">
                {game.genre}
              </span>
              <span
                className={`text-xs font-bold rounded-full px-2 py-0.5 ${getRatingColor(game.rating)}`}
              >
                ★ {game.rating}/10
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              {game.isDigital ? (
                <>
                  <Wifi size={12} />
                  <span>Digital</span>
                </>
              ) : (
                <>
                  <Package size={12} />
                  <span>Physical</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onEdit(game);
              }}
              aria-label={`Edit ${game.title}`}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onDelete(game.id);
              }}
              aria-label={`Delete ${game.title}`}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GameList;
