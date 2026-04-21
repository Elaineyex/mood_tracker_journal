import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

export default function PeriodSelector({ volume, pain, color, onChange }: { 
  volume?: number;
  pain?: number;
  color?: string;
  onChange: (field: 'periodVolume' | 'periodPain' | 'periodColor', value: any) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-white"
      >
        <span className="font-semibold text-gray-800">Period</span>
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center">
             <Plus size={16} />
          </div>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      
      {expanded && (
        <div className="p-4 pt-0 space-y-6">
          {/* Volume */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Volume</h3>
            <div className="flex justify-between gap-2">
              {[
                { v: 1, l: 'Spotting', icon: '🩸' }, 
                { v: 2, l: 'Light', icon: '💧' }, 
                { v: 3, l: 'Medium', icon: '💧💧' }, 
                { v: 4, l: 'Heavy', icon: '🌊' }
              ].map(item => (
                <button 
                  key={item.v}
                  onClick={() => onChange('periodVolume', volume === item.v ? undefined : item.v)}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors border-2 ${
                    volume === item.v 
                      ? 'bg-red-50 text-red-500 border-red-500' 
                      : 'bg-gray-50 text-gray-400 border-transparent hover:border-red-200'
                  }`}>
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-center leading-tight px-1 text-gray-600">{item.l}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Color */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Color</h3>
            <div className="flex gap-4">
              {[
                { v: 'red', l: 'Red', bg: 'bg-red-600' }, 
                { v: 'brown', l: 'Brown', bg: 'bg-[#7E4C3A]' } // more pleasing brown
              ].map(item => (
                <button 
                  key={item.v}
                  onClick={() => onChange('periodColor', color === item.v ? undefined : item.v)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 ${
                    color === item.v 
                      ? `border-gray-800 ${item.bg} scale-110 shadow-sm` 
                      : `border-transparent ${item.bg} opacity-80 hover:opacity-100`
                  }`}>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{item.l}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pain */}
          <div>
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pain</h3>
               {pain && <span className="text-xs bg-indigo-50 px-2 py-1 rounded-full text-indigo-600 font-bold">Level {pain}</span>}
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                 <button
                  key={v}
                  onClick={() => onChange('periodPain', pain === v ? undefined : v)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
                    pain === v 
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-500 scale-110' 
                      : 'bg-gray-50 text-gray-400 border-transparent hover:border-indigo-200'
                  }`}
                 >
                    {v}
                 </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
