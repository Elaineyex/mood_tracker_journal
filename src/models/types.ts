export interface JournalEntry {
  id?: number;
  date: string;
  mood: number; // 1-5
  activities: string[];
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  journal: string;
  imagePath?: string | null;
  periodVolume?: number;
  periodPain?: number;
  periodColor?: string;
}

export const MOODS = [
  { value: 1, emoji: '😄', label: 'Awesome' },
  { value: 2, emoji: '🙂', label: 'Good' },
  { value: 3, emoji: '😐', label: 'Meh' },
  { value: 4, emoji: '🙁', label: 'Bad' },
  { value: 5, emoji: '😭', label: 'Awful' },
];

export const ACTIVITIES = {
  Sleep: ['Good', 'Neutral', 'Bad', 'Sleep early', 'Wake early'],
  Social: ['Family', 'Friends', 'Party'],
  Food: ['Fast food', 'Home-made', 'Restaurant', 'Delivery'],
  Exercise: ['Walking', 'Running', 'Cycling'],
};
