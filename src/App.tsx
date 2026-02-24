/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import AddEntryScreen from './screens/AddEntryScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNav from './widgets/BottomNav';
import { notificationService } from './services/notifications';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');

  useEffect(() => {
    // Attempt to schedule if permission was already granted previously
    if ('Notification' in window && Notification.permission === 'granted') {
      notificationService.scheduleDailyReminder();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-emerald-200">
      {currentTab === 'home' && <HomeScreen onAdd={() => setCurrentTab('add')} />}
      {currentTab === 'stats' && <StatsScreen />}
      {currentTab === 'settings' && <SettingsScreen />}
      {currentTab === 'add' && <AddEntryScreen onBack={() => setCurrentTab('home')} />}

      {currentTab !== 'add' && (
        <BottomNav currentTab={currentTab} onChange={setCurrentTab} />
      )}
    </div>
  );
}
