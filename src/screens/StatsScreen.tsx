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
import { Card, Tag, Time } from 'animal-island-ui';
import { getJournalDateKey, parseJournalDate } from '../utils/journalDate';

const AI_COLORS = {
  appGreen: '#8ac68a',
  appPink: '#f8a6b2',
  purple: '#b77dee',
  appBlue: '#889df0',
  appYellow: '#f7cd67',
  appOrange: '#e59266',
  appTeal: '#82d5bb',
  appRed: '#fc736d',
  brownText: '#725d42',
  parchmentBorder: '#d4c4a8',
};

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
    const entry = entries.find(e => getJournalDateKey(e.date) === format(day, 'yyyy-MM-dd'));
    return { name: format(day, 'd'), mood: entry ? 6 - entry.mood : null };
  });

  // Selected month average
  const selEntries = entries.filter(e => {
    const d = parseJournalDate(e.date);
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
  });
  const avgMood = selEntries.length > 0
    ? (selEntries.reduce((acc, e) => acc + (6 - e.mood), 0) / selEntries.length).toFixed(1)
    : 'N/A';

  // Past 6 months bar chart
  const past6 = Array.from({ length: 6 }, (_, i) => subMonths(today, 5 - i));
  const monthlyAvgData = past6.map(month => {
    const me = entries.filter(e => {
      const d = parseJournalDate(e.date);
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    });
    return {
      name: format(month, 'MMM'),
      avg: me.length > 0 ? parseFloat((me.reduce((a, e) => a + (6 - e.mood), 0) / me.length).toFixed(1)) : 0,
      entryCount: me.length,
    };
  });

  // All-time mood distribution
  const moodCounts = [0, 0, 0, 0, 0];
  entries.forEach(e => { if (e.mood >= 1 && e.mood <= 5) moodCounts[e.mood - 1]++; });
  const pieData = MOODS.map((m, i) => ({
    name: m.label, value: moodCounts[i],
    color: [AI_COLORS.appGreen, AI_COLORS.appTeal, AI_COLORS.appBlue, AI_COLORS.appYellow, AI_COLORS.appPink][i],
  })).filter(d => d.value > 0);

  return (
    <div className="p-4 pb-24 space-y-6 stats-screen">
      <div className="flex items-start justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Explore Charts</h1>
        <Time className="journal-time" />
      </div>

      {/* Health Insights */}
      {insights && (
        <Card color="app-green" pattern="app-green" className="space-y-4 health-insights-card">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Health Insights</h2>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {insights.summary}
          </div>
          {insights.predictions && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/90 p-3 rounded-xl border border-white/60">
                <p className="text-[10px] text-[#3a6b3a] font-bold uppercase tracking-wider">Next Period</p>
                <p className="text-lg font-bold text-[#3a6b3a]">{format(new Date(insights.predictions.predicted_start_date), 'MMM d')}</p>
              </div>
              <div className="bg-white/90 p-3 rounded-xl border border-white/60">
                <p className="text-[10px] text-[#3a6b3a] font-bold uppercase tracking-wider">Ovulation</p>
                <p className="text-lg font-bold text-[#3a6b3a]">{format(new Date(insights.predictions.predicted_ovulation_date), 'MMM d')}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button onClick={() => setSelectedMonth(m => subMonths(m, 1))} className="p-2 rounded-full hover:bg-[#f0e8d8]">
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-semibold">{format(selectedMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setSelectedMonth(m => addMonths(m, 1))} disabled={!canGoNext}
          className="p-2 rounded-full hover:bg-[#f0e8d8] disabled:opacity-30">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Monthly mood line chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Mood Chart</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 10 }} interval={4} />
              <YAxis domain={[1, 5]} hide />
              <Tooltip cursor={{ stroke: AI_COLORS.parchmentBorder, strokeWidth: 2 }} />
              <Line type="monotone" dataKey="mood" stroke={AI_COLORS.appGreen} strokeWidth={3}
                dot={{ r: 3, fill: AI_COLORS.appGreen }} activeDot={{ r: 5 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly average */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-2">Monthly Average</h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#e8f5e8] text-[#3a6b3a] rounded-full flex items-center justify-center text-xl font-bold">
            {avgMood}
          </div>
          <span>Avg mood: {avgMood} out of {selEntries.length} entries in {format(selectedMonth, 'MMMM yyyy')}</span>
        </div>
      </div>

      {/* Past 6 months bar chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Past 6 Months</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyAvgData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis domain={[0, 5]} hide />
              <Tooltip
                formatter={(val: any, _name: any, item: any) => [
                  `Avg mood: ${val || 'No data'} out of ${item.payload.entryCount} entries`,
                  '',
                ]}
              />
              <Bar dataKey="avg" fill={AI_COLORS.appGreen} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All-time mood distribution */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Mood Statistics</h2>
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
            <span className="text-3xl font-bold">{entries.length}</span>
            <span className="text-xs uppercase tracking-wider">Entries</span>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          {MOODS.map((m, i) => (
            <div key={m.value} className="flex flex-col items-center">
              <span className="text-2xl mb-1">{m.emoji}</span>
              <Tag color={i === 0 ? 'app-green' : i === 1 ? 'app-teal' : i === 2 ? 'app-blue' : i === 3 ? 'app-yellow' : 'app-pink'} size="small">
                {moodCounts[i]}
              </Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
