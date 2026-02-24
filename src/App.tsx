import { useState } from 'react';
import type { Game } from './models/Game';
import GameForm from './components/GameForm';
import GameList from './components/GameList';
import { Gamepad2 } from 'lucide-react';

const initialData: Game[] = [
  { id: crypto.randomUUID(), title: 'The Legend of Zelda: Breath of the Wild', genre: 'Adventure', isDigital: false, rating: 10 },
  { id: crypto.randomUUID(), title: 'Super Mario Odyssey', genre: 'Platformer', isDigital: true, rating: 9 },
  { id: crypto.randomUUID(), title: 'Mario Kart 8 Deluxe', genre: 'Racing', isDigital: false, rating: 8 },
];

function App() {
  const [games, setGames] = useState<Game[]>(initialData);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const handleSubmit = (game: Game) => {
    if (editingGame) {
      setGames((prev) => prev.map((g) => (g.id === game.id ? game : g)));
      setEditingGame(null);
    } else {
      setGames((prev) => [...prev, game]);
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
    if (editingGame?.id === id) setEditingGame(null);
  };

  const handleCancelEdit = () => {
    setEditingGame(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Gamepad2 size={36} className="text-indigo-600" />
            <h1 className="text-3xl font-extrabold text-indigo-700">Nintendo Collection</h1>
          </div>
          <p className="text-gray-500 text-sm">Manage your Nintendo video game library</p>
        </header>

        <GameForm
          key={editingGame?.id ?? 'new'}
          onSubmit={handleSubmit}
          editingGame={editingGame}
          onCancelEdit={handleCancelEdit}
        />

        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            My Collection
            <span className="ml-2 text-sm font-normal text-gray-400">({games.length} games)</span>
          </h2>
          <GameList games={games} onEdit={handleEdit} onDelete={handleDelete} />
        </section>
      </div>
    </div>
  );
}

export default App;
