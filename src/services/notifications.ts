export const notificationService = {
  requestPermission: async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  scheduleDailyReminder: () => {
    // In a real app, this would use a Service Worker for background notifications.
    // For this MVP, we'll just check periodically while the app is open.
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 21 && now.getMinutes() === 0) {
        if (Notification.permission === 'granted') {
          new Notification('How was your day?', {
            body: 'Write your journal ✨',
            icon: '/favicon.ico'
          });
        }
      }
    }, 60000); // Check every minute
  }
};
