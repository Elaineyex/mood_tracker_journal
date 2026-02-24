import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { JournalEntry, MOODS } from '../models/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export default function StatsScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEntries().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;

  // Weekly Mood Chart Data
  const today = new Date();
  const start = startOfWeek(today);
  const end = endOfWeek(today);
  const weekDays = eachDayOfInterval({ start, end });

  const weeklyData = weekDays.map(day => {
    const entry = entries.find(e => format(new Date(e.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
    return {
      name: format(day, 'EEE'),
      mood: entry ? 6 - entry.mood : null, // Invert mood so 5 (Awesome) is high, 1 (Awful) is low
    };
  });

  // Monthly Average Mood
  const currentMonthEntries = entries.filter(e => new Date(e.date).getMonth() === today.getMonth());
  const avgMood = currentMonthEntries.length > 0
    ? (currentMonthEntries.reduce((acc, e) => acc + (6 - e.mood), 0) / currentMonthEntries.length).toFixed(1)
    : 'N/A';

  // Mood Distribution
  const moodCounts = [0, 0, 0, 0, 0];
  entries.forEach(e => {
    if (e.mood >= 1 && e.mood <= 5) moodCounts[e.mood - 1]++;
  });

  const pieData = MOODS.map((m, i) => ({
    name: m.label,
    value: moodCounts[i],
    color: ['#10b981', '#84cc16', '#3b82f6', '#f59e0b', '#ef4444'][i]
  })).filter(d => d.value > 0);

  return (
    <div className="p-4 pb-24 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Explore Charts</h1>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Mood Chart</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis domain={[1, 5]} hide />
              <Tooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Mood Statistics</h2>
        <div className="flex items-center justify-center h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-4 flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-800">{entries.length}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Entries</span>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          {MOODS.map((m, i) => (
            <div key={m.value} className="flex flex-col items-center">
              <span className="text-2xl mb-1">{m.emoji}</span>
              <span className="text-xs font-bold text-gray-600">{moodCounts[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Monthly Average</h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold">
            {avgMood}
          </div>
          <span className="text-gray-500">Average mood score this month</span>
        </div>
      </div>
    </div>
  );
}
