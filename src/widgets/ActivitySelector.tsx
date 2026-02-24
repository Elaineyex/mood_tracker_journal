import { ACTIVITIES } from '../models/types';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

export default function ActivitySelector({ selected, onChange }: { selected: string[], onChange: (val: string[]) => void }) {
  const [expanded, setExpanded] = useState<string | null>(Object.keys(ACTIVITIES)[0]);

  const toggleActivity = (act: string) => {
    if (selected.includes(act)) {
      onChange(selected.filter(a => a !== act));
    } else {
      onChange([...selected, act]);
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(ACTIVITIES).map(([category, items]) => {
        const isExpanded = expanded === category;
        return (
          <div key={category} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <button
              onClick={() => setExpanded(isExpanded ? null : category)}
              className="w-full flex items-center justify-between p-4 bg-white"
            >
              <span className="font-semibold text-gray-800">{category}</span>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center">
                  <Plus size={16} />
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            
            {isExpanded && (
              <div className="p-4 pt-0 grid grid-cols-4 gap-4">
                {items.map(item => {
                  const isSelected = selected.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleActivity(item)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className="text-xs font-medium text-center leading-tight px-1">
                          {item}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
