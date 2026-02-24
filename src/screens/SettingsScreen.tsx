import { useState, useEffect } from 'react';
import { notificationService } from '../services/notifications';
import { Bell, Shield, HelpCircle, LogOut } from 'lucide-react';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await notificationService.requestPermission();
      setNotificationsEnabled(granted);
      if (granted) {
        notificationService.scheduleDailyReminder();
      }
    } else {
      // In a real app, we'd disable the service worker or interval.
      // For MVP, we just update state.
      setNotificationsEnabled(false);
      alert('Notifications disabled in app, but browser permission remains. Revoke in browser settings if needed.');
    }
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-full">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-800">Daily Reminder</p>
              <p className="text-xs text-gray-400">21:00 every day</p>
            </div>
          </div>
          <button 
            onClick={toggleNotifications}
            className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="p-4 flex items-center justify-between border-b border-gray-50 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-full">
              <Shield size={20} />
            </div>
            <p className="font-medium text-gray-800">Privacy & Security</p>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-500 rounded-full">
              <HelpCircle size={20} />
            </div>
            <p className="font-medium text-gray-800">Help & Support</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-red-50 text-red-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-full">
              <LogOut size={20} />
            </div>
            <p className="font-medium">Sign Out</p>
          </div>
        </div>
      </div>
    </div>
  );
}
