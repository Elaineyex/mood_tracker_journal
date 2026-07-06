import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { JournalEntry, MOODS } from '../models/types';
import { PlusCircle, Image as ImageIcon } from 'lucide-react';
import { Button, Icon, Tag, Time, Title } from 'animal-island-ui';
import { formatJournalDate, isJournalDateOnly } from '../utils/journalDate';

export default function HomeScreen({ onAdd, onEdit }: { onAdd: () => void; onEdit: (entry: JournalEntry) => void }) {
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
    <div className="p-4 pb-24 space-y-4 journal-home-screen">
      <div className="flex justify-between items-start gap-3 mb-6">
        <div className="journal-title-wrap">
          <Icon name="icon-miles" size={48} bounce className="journal-title-icon" />
          <Title color="app-green" size="large" className="journal-title">
            My Journal
          </Title>
        </div>
        <div className="flex items-center gap-2">
          <Time className="journal-time" />
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
          <div className="bg-gray-100 p-6 rounded-full">
            <PlusCircle size={48} className="text-gray-300" />
          </div>
          <p>No entries yet. Start journaling!</p>
          <Button onClick={onAdd} type="primary">
            Add Entry
          </Button>
        </div>
      ) : (
        entries.map(entry => {
          const mood = MOODS.find(m => m.value === entry.mood);
          const gratitudeItems = [entry.gratitude1, entry.gratitude2, entry.gratitude3].map(item => item?.trim() || '');
          return (
            <article
              key={entry.id}
              className="w-full overflow-hidden rounded-[20px] bg-white shadow-sm border border-gray-100 transition-colors hover:border-[#8ac68a]"
            >
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className="w-full text-left p-4 space-y-3 focus:outline-none focus:ring-2 focus:ring-[#8ac68a]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{mood?.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{formatJournalDate(entry.date, 'EEE, MMMM d, yyyy')}</p>
                      <p className="text-xs text-gray-400">
                        {isJournalDateOnly(entry.date) ? 'All day' : formatJournalDate(entry.date, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {entry.activities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.activities.map(act => (
                      <Tag key={act} color="app-green" size="small">
                        {act}
                      </Tag>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Gratitude Journal</p>
                  <ul className="space-y-1.5 pl-5 text-sm text-gray-600 list-disc marker:text-[#8ac68a]">
                    {gratitudeItems.map((item, index) => (
                      <li key={`${entry.id}-gratitude-${index}`} className={item ? 'leading-relaxed' : 'text-gray-300 leading-relaxed italic'}>
                        {item || 'No note added'}
                      </li>
                    ))}
                  </ul>
                </div>

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
              </button>
            </article>
          );
        })
      )}
    </div>
  );
}
