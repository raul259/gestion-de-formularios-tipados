import React, { useState } from 'react';
import type { Game } from '../models/Game';
import { PlusCircle, Save, XCircle } from 'lucide-react';

interface GameFormProps {
  onSubmit: (game: Game) => void;
  editingGame: Game | null;
  onCancelEdit: () => void;
}

const GENRES = ['Action', 'Adventure', 'RPG', 'Platformer', 'Sports', 'Puzzle', 'Fighting', 'Racing', 'Simulation', 'Strategy'];

const emptyForm: Omit<Game, 'id'> = {
  title: '',
  genre: GENRES[0],
  isDigital: false,
  rating: 1,
};

const toFormData = (game: Game): Omit<Game, 'id'> => ({
  title: game.title,
  genre: game.genre,
  isDigital: game.isDigital,
  rating: game.rating,
});

const GameForm: React.FC<GameFormProps> = ({ onSubmit, editingGame, onCancelEdit }) => {
  const [formData, setFormData] = useState<Omit<Game, 'id'>>(
    editingGame ? toFormData(editingGame) : emptyForm
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'rating') {
      setFormData((prev) => ({ ...prev, rating: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    const game: Game = {
      id: editingGame ? editingGame.id : crypto.randomUUID(),
      ...formData,
    };
    onSubmit(game);
    setFormData(emptyForm);
  };

  const isEditing = editingGame !== null;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md p-6 space-y-4 border border-gray-100"
    >
      <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
        {isEditing ? <Save size={22} /> : <PlusCircle size={22} />}
        {isEditing ? 'Edit Game' : 'Add New Game'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g. The Legend of Zelda"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="genre">
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rating">
            Rating (1–10): <span className="font-semibold text-indigo-600">{formData.rating}</span>
          </label>
          <input
            id="rating"
            name="rating"
            type="range"
            min={1}
            max={10}
            value={formData.rating}
            onChange={handleChange}
            className="w-full accent-indigo-600"
          />
        </div>

        <div className="flex items-center gap-3 mt-2">
          <input
            id="isDigital"
            name="isDigital"
            type="checkbox"
            checked={formData.isDigital}
            onChange={handleChange}
            className="w-4 h-4 accent-indigo-600"
          />
          <label className="text-sm font-medium text-gray-700" htmlFor="isDigital">
            Digital Copy
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {isEditing ? <Save size={16} /> : <PlusCircle size={16} />}
          {isEditing ? 'Save Changes' : 'Add Game'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <XCircle size={16} />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default GameForm;
