import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { JournalEntry, MOODS } from '../models/types';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  subMonths, addMonths, isBefore, startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function StatsScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [insights, setInsights] = useState<{ summary: string, predictions: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    Promise.all([
      api.getEntries(),
      api.getInsights()
    ]).then(([entriesData, insightsData]) => {
      setEntries(entriesData);
      setInsights(insightsData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
    </div>
  );

  const today = new Date();
  const canGoNext = isBefore(startOfMonth(selectedMonth), startOfMonth(today));

  // Monthly mood chart
  const monthDays = eachDayOfInterval({ start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) });
  const monthlyData = monthDays.map(day => {
    const entry = entries.find(e => format(new Date(e.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
    return { name: format(day, 'd'), mood: entry ? 6 - entry.mood : null };
  });

  // Selected month average
  const selEntries = entries.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
  });
  const avgMood = selEntries.length > 0
    ? (selEntries.reduce((acc, e) => acc + (6 - e.mood), 0) / selEntries.length).toFixed(1)
    : 'N/A';

  // Past 6 months bar chart
  const past6 = Array.from({ length: 6 }, (_, i) => subMonths(today, 5 - i));
  const monthlyAvgData = past6.map(month => {
    const me = entries.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    });
    return {
      name: format(month, 'MMM'),
      avg: me.length > 0 ? parseFloat((me.reduce((a, e) => a + (6 - e.mood), 0) / me.length).toFixed(1)) : 0,
    };
  });

  // All-time mood distribution
  const moodCounts = [0, 0, 0, 0, 0];
  entries.forEach(e => { if (e.mood >= 1 && e.mood <= 5) moodCounts[e.mood - 1]++; });
  const pieData = MOODS.map((m, i) => ({
    name: m.label, value: moodCounts[i],
    color: ['#10b981', '#84cc16', '#3b82f6', '#f59e0b', '#ef4444'][i],
  })).filter(d => d.value > 0);

  return (
    <div className="p-4 pb-24 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Explore Charts</h1>

      {/* Health Insights */}
      {insights && (
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <h2 className="text-lg font-bold">Health Insights</h2>
          </div>
          <div className="whitespace-pre-wrap text-sm text-emerald-800 leading-relaxed">
            {insights.summary}
          </div>
          {insights.predictions && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Next Period</p>
                <p className="text-lg font-bold text-emerald-900">{format(new Date(insights.predictions.predicted_start_date), 'MMM d')}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Ovulation</p>
                <p className="text-lg font-bold text-emerald-900">{format(new Date(insights.predictions.predicted_ovulation_date), 'MMM d')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button onClick={() => setSelectedMonth(m => subMonths(m, 1))} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <span className="text-lg font-semibold text-gray-800">{format(selectedMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setSelectedMonth(m => addMonths(m, 1))} disabled={!canGoNext}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Monthly mood line chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Mood Chart</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 10 }} interval={4} />
              <YAxis domain={[1, 5]} hide />
              <Tooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3}
                dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly average */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Monthly Average</h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold">
            {avgMood}
          </div>
          <span className="text-gray-500">Average mood for {format(selectedMonth, 'MMMM yyyy')}</span>
        </div>
      </div>

      {/* Past 6 months bar chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Past 6 Months</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyAvgData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis domain={[0, 5]} hide />
              <Tooltip formatter={(val: any) => [val || 'No data', 'Avg mood']} />
              <Bar dataKey="avg" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All-time mood distribution */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Mood Statistics</h2>
        <div className="flex items-center justify-center h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="100%" startAngle={180} endAngle={0}
                innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
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
    </div>
  );
}
