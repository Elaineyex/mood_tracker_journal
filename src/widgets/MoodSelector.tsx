import { MOODS } from '../models/types';

export default function MoodSelector({ selected, onChange }: { selected: number | null, onChange: (val: number) => void }) {
  return (
    <div className="flex justify-between items-center">
      {MOODS.map((mood) => {
        const isSelected = selected === mood.value;
        return (
          <button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              isSelected ? 'bg-[#e8f5e8] scale-110' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <span className="text-4xl mb-1">{mood.emoji}</span>
            <span className="text-xs font-medium">
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
