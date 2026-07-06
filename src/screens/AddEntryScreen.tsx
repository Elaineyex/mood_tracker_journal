import { useRef, useState } from 'react';
import { api } from '../services/api';
import MoodSelector from '../widgets/MoodSelector';
import ActivitySelector from '../widgets/ActivitySelector';
import PeriodSelector from '../widgets/PeriodSelector';
import { ArrowLeft, Check, Image as ImageIcon } from 'lucide-react';
import { JournalEntry } from '../models/types';
import { format, parseISO } from 'date-fns';
import { Button, Card, Footer } from 'animal-island-ui';
import { getJournalDateKey } from '../utils/journalDate';

type AddEntryScreenProps = {
  entry?: JournalEntry;
  onBack: () => void;
};

export default function AddEntryScreen({ entry, onBack }: AddEntryScreenProps) {
  const isEditing = Boolean(entry?.id);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(entry?.date ? getJournalDateKey(entry.date) : today);
  const [activities, setActivities] = useState<string[]>(entry?.activities ?? []);
  const [gratitude1, setGratitude1] = useState(entry?.gratitude1 ?? '');
  const [gratitude2, setGratitude2] = useState(entry?.gratitude2 ?? '');
  const [gratitude3, setGratitude3] = useState(entry?.gratitude3 ?? '');
  const [journal, setJournal] = useState(entry?.journal ?? '');
  const [periodVolume, setPeriodVolume] = useState<number | undefined>(entry?.periodVolume);
  const [periodPain, setPeriodPain] = useState<number | undefined>(entry?.periodPain);
  const [periodColor, setPeriodColor] = useState<string | undefined>(entry?.periodColor);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePeriodChange = (field: 'periodVolume' | 'periodPain' | 'periodColor', value: any) => {
    if (field === 'periodVolume') setPeriodVolume(value);
    if (field === 'periodPain') setPeriodPain(value);
    if (field === 'periodColor') setPeriodColor(value);
  };

  const handleOpenDatePicker = () => {
    const dateInput = dateInputRef.current;
    if (!dateInput) return;

    if (typeof dateInput.showPicker === 'function') {
      dateInput.showPicker();
    } else {
      dateInput.click();
    }
  };

  const handleSave = async () => {
    if (!mood) return alert('Please select a mood');
    setLoading(true);
    try {
      const payload = {
        date,
        mood,
        activities,
        gratitude1,
        gratitude2,
        gratitude3,
        journal,
        periodVolume,
        periodPain,
        periodColor,
        imagePath: entry?.imagePath || undefined,
      };

      if (isEditing && entry?.id) {
        await api.updateEntry(entry.id, payload, file || undefined);
      } else {
        await api.createEntry(payload, file || undefined);
      }

      onBack();
    } catch (e) {
      console.error(e);
      alert(isEditing ? 'Failed to update entry' : 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 journal-entry-screen">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-4 flex justify-between items-center border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-lg">{isEditing ? 'Edit Entry' : 'New Entry'}</h1>
        <button 
          onClick={handleSave} 
          disabled={loading || !mood}
          className={`p-2 rounded-full ${mood ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300'}`}
        >
          {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500" /> : <Check size={24} />}
        </button>
      </div>

      <div className="p-4 space-y-8 max-w-2xl mx-auto">
        <section>
          <Card className="journal-entry-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-1">Date</h2>
                <p className="font-semibold mb-0">{format(parseISO(date), 'EEE, MMMM d, yyyy')}</p>
              </div>
              <div className="relative inline-flex">
                <Button type="default" onClick={handleOpenDatePicker}>Change date</Button>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  max={today}
                  onChange={e => setDate(e.target.value)}
                  aria-label="Choose journal date"
                  className="pointer-events-none absolute h-px w-px opacity-0"
                  tabIndex={-1}
                />
              </div>
            </div>
          </Card>
        </section>

        <section>
          <Card className="journal-entry-card">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3">How are you?</h2>
            <MoodSelector selected={mood} onChange={setMood} />
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">What have you been doing?</h2>
          <ActivitySelector selected={activities} onChange={setActivities} />
        </section>

        <section>
          <PeriodSelector 
            volume={periodVolume} 
            pain={periodPain} 
            color={periodColor} 
            onChange={handlePeriodChange} 
          />
        </section>

        <section>
          <Card className="journal-entry-card">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3">Gratitude Journal</h2>
            <div className="space-y-3">
              <p className="text-sm mb-2">List three things you are grateful for:</p>
              <input 
                type="text" 
                placeholder="1." 
                value={gratitude1} onChange={e => setGratitude1(e.target.value)}
                className="w-full border-b border-[#d4c4a8] py-2 bg-transparent focus:outline-none focus:border-[#8ac68a] transition-colors"
              />
              <input 
                type="text" 
                placeholder="2." 
                value={gratitude2} onChange={e => setGratitude2(e.target.value)}
                className="w-full border-b border-[#d4c4a8] py-2 bg-transparent focus:outline-none focus:border-[#8ac68a] transition-colors"
              />
              <input 
                type="text" 
                placeholder="3." 
                value={gratitude3} onChange={e => setGratitude3(e.target.value)}
                className="w-full border-b border-[#d4c4a8] py-2 bg-transparent focus:outline-none focus:border-[#8ac68a] transition-colors"
              />
            </div>
          </Card>
        </section>

        <section>
          <Card className="journal-entry-card">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3">Journal</h2>
            <div className="space-y-4">
              <textarea
                placeholder="Write your thoughts..."
                value={journal}
                onChange={e => setJournal(e.target.value)}
                className="w-full h-32 resize-none focus:outline-none bg-transparent"
              />
              
              <div className="flex flex-wrap gap-2 pt-4 border-t border-[#d4c4a8]">
                <label className="flex items-center gap-2 px-4 py-2 bg-[#f8f8f0] rounded-full text-sm font-medium cursor-pointer hover:bg-[#f0e8d8] transition-colors">
                  <ImageIcon size={16} />
                  {file ? 'Photo selected' : entry?.imagePath ? 'Replace Photo' : 'Add Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                </label>
                {entry?.imagePath && !file && (
                  <span className="flex items-center gap-1 px-3 py-2 bg-[#f8f8f0] rounded-full text-sm font-medium">
                    <ImageIcon size={16} />
                    Current photo kept
                  </span>
                )}
              </div>
            </div>
          </Card>
        </section>

        <Footer type="sea" seamless className="daily-journal-footer" />
      </div>
    </div>
  );
}
