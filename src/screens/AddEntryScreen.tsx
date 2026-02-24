import { useState } from 'react';
import { api } from '../services/api';
import MoodSelector from '../widgets/MoodSelector';
import ActivitySelector from '../widgets/ActivitySelector';
import { ArrowLeft, Check, Image as ImageIcon } from 'lucide-react';

export default function AddEntryScreen({ onBack }: { onBack: () => void }) {
  const [mood, setMood] = useState<number | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [journal, setJournal] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!mood) return alert('Please select a mood');
    setLoading(true);
    try {
      await api.createEntry({
        mood,
        activities,
        gratitude1,
        gratitude2,
        gratitude3,
        journal,
      }, file || undefined);
      onBack();
    } catch (e) {
      console.error(e);
      alert('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-4 flex justify-between items-center border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-lg">New Entry</h1>
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
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">How are you?</h2>
          <MoodSelector selected={mood} onChange={setMood} />
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">What have you been doing?</h2>
          <ActivitySelector selected={activities} onChange={setActivities} />
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Gratitude Journal</h2>
          <div className="space-y-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">List three things you are grateful for:</p>
            <input 
              type="text" 
              placeholder="1." 
              value={gratitude1} onChange={e => setGratitude1(e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <input 
              type="text" 
              placeholder="2." 
              value={gratitude2} onChange={e => setGratitude2(e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <input 
              type="text" 
              placeholder="3." 
              value={gratitude3} onChange={e => setGratitude3(e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Journal</h2>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <textarea
              placeholder="Write your thoughts..."
              value={journal}
              onChange={e => setJournal(e.target.value)}
              className="w-full h-32 resize-none focus:outline-none text-gray-700"
            />
            
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                <ImageIcon size={16} />
                {file ? 'Photo selected' : 'Add Photo'}
                <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
