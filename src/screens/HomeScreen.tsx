import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { JournalEntry, MOODS } from '../models/types';
import { format } from 'date-fns';
import { PlusCircle, Image as ImageIcon, Calendar } from 'lucide-react';

export default function HomeScreen({ onAdd }: { onAdd: () => void }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEntries().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Journal</h1>
        <button className="text-emerald-500 bg-emerald-50 p-2 rounded-full">
          <Calendar size={20} />
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
          <div className="bg-gray-100 p-6 rounded-full">
            <PlusCircle size={48} className="text-gray-300" />
          </div>
          <p>No entries yet. Start journaling!</p>
          <button onClick={onAdd} className="bg-emerald-500 text-white px-6 py-2 rounded-full font-medium shadow-md">
            Add Entry
          </button>
        </div>
      ) : (
        entries.map(entry => {
          const mood = MOODS.find(m => m.value === entry.mood);
          return (
            <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{mood?.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{format(new Date(entry.date), 'MMMM d, yyyy')}</p>
                    <p className="text-xs text-gray-400">{format(new Date(entry.date), 'h:mm a')}</p>
                  </div>
                </div>
              </div>
              
              {entry.activities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.activities.map(act => (
                    <span key={act} className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-medium">
                      {act}
                    </span>
                  ))}
                </div>
              )}

              {entry.journal && (
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {entry.journal}
                </p>
              )}

              {entry.imagePath && (
                <div className="flex gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded"><ImageIcon size={14}/> Image attached</div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
