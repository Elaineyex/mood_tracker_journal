/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import AddEntryScreen from './screens/AddEntryScreen';
import StatsScreen from './screens/StatsScreen';
import BottomNav from './widgets/BottomNav';
import { notificationService } from './services/notifications';
import { JournalEntry } from './models/types';

type Tab = 'home' | 'stats' | 'add' | 'edit';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    // Attempt to schedule if permission was already granted previously
    if ('Notification' in window && Notification.permission === 'granted') {
      notificationService.scheduleDailyReminder();
    }
  }, []);

  const showHome = () => {
    setSelectedEntry(null);
    setCurrentTab('home');
  };

  const showAdd = () => {
    setSelectedEntry(null);
    setCurrentTab('add');
  };

  const showEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setCurrentTab('edit');
  };

  const handleTabChange = (tab: string) => {
    setSelectedEntry(null);
    setCurrentTab(tab as Tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-emerald-200">
      {currentTab === 'home' && <HomeScreen onAdd={showAdd} onEdit={showEdit} />}
      {currentTab === 'stats' && <StatsScreen />}
      {currentTab === 'add' && <AddEntryScreen onBack={showHome} />}
      {currentTab === 'edit' && selectedEntry && (
        <AddEntryScreen entry={selectedEntry} onBack={showHome} />
      )}

      {currentTab !== 'add' && currentTab !== 'edit' && (
        <BottomNav currentTab={currentTab} onChange={handleTabChange} />
      )}
    </div>
  );
}
