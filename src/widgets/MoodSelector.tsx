import { MOODS } from '../models/types';

export default function MoodSelector({ selected, onChange }: { selected: number | null, onChange: (val: number) => void }) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
      {MOODS.map((mood) => {
        const isSelected = selected === mood.value;
        return (
          <button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              isSelected ? 'bg-emerald-50 scale-110' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <span className="text-4xl mb-1">{mood.emoji}</span>
            <span className={`text-xs font-medium ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
