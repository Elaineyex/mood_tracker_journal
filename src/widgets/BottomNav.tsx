import { Calendar, BarChart2, PlusCircle, Settings } from 'lucide-react';

export default function BottomNav({ currentTab, onChange }: { currentTab: string, onChange: (tab: string) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-4 pb-safe">
      <button onClick={() => onChange('home')} className={`flex flex-col items-center p-2 ${currentTab === 'home' ? 'text-emerald-500' : 'text-gray-400'}`}>
        <Calendar size={24} />
        <span className="text-xs mt-1 font-medium">Journal</span>
      </button>
      <button onClick={() => onChange('stats')} className={`flex flex-col items-center p-2 ${currentTab === 'stats' ? 'text-emerald-500' : 'text-gray-400'}`}>
        <BarChart2 size={24} />
        <span className="text-xs mt-1 font-medium">Stats</span>
      </button>
      <button onClick={() => onChange('add')} className="flex flex-col items-center justify-center -mt-6">
        <div className="bg-emerald-500 rounded-full p-3 shadow-lg text-white">
          <PlusCircle size={32} />
        </div>
      </button>
      <button onClick={() => onChange('settings')} className={`flex flex-col items-center p-2 ${currentTab === 'settings' ? 'text-emerald-500' : 'text-gray-400'}`}>
        <Settings size={24} />
        <span className="text-xs mt-1 font-medium">Settings</span>
      </button>
    </div>
  );
}
