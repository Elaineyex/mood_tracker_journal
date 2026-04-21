import { JournalEntry } from '../models/types';

export const api = {
  getEntries: async (): Promise<JournalEntry[]> => {
    const res = await fetch('/api/entries');
    if (!res.ok) throw new Error(`Failed to fetch entries: ${res.statusText}`);
    return res.json();
  },
  
  createEntry: async (entry: Partial<JournalEntry>, file?: File): Promise<{ id: number }> => {
    const formData = new FormData();
    formData.append('date', entry.date || new Date().toISOString());
    formData.append('mood', String(entry.mood));
    formData.append('activities', JSON.stringify(entry.activities || []));
    formData.append('gratitude1', entry.gratitude1 || '');
    formData.append('gratitude2', entry.gratitude2 || '');
    formData.append('gratitude3', entry.gratitude3 || '');
    formData.append('journal', entry.journal || '');
    
    if (entry.imagePath) formData.append('imagePath', entry.imagePath);
    if (file) formData.append('image', file);

    const res = await fetch('/api/entries', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Failed to create entry: ${res.statusText}`);
    return res.json();
  },

  updateEntry: async (id: number, entry: Partial<JournalEntry>, file?: File): Promise<{ success: boolean }> => {
    const formData = new FormData();
    formData.append('date', entry.date || new Date().toISOString());
    formData.append('mood', String(entry.mood));
    formData.append('activities', JSON.stringify(entry.activities || []));
    formData.append('gratitude1', entry.gratitude1 || '');
    formData.append('gratitude2', entry.gratitude2 || '');
    formData.append('gratitude3', entry.gratitude3 || '');
    formData.append('journal', entry.journal || '');
    
    if (entry.imagePath) formData.append('imagePath', entry.imagePath);
    if (file) formData.append('image', file);

    const res = await fetch(`/api/entries/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!res.ok) throw new Error(`Failed to update entry: ${res.statusText}`);
    return res.json();
  },

  deleteEntry: async (id: number): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/entries/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete entry: ${res.statusText}`);
    return res.json();
  },

  getInsights: async (): Promise<{ summary: string, predictions: any }> => {
    const res = await fetch('/api/insights');
    if (!res.ok) throw new Error(`Failed to fetch insights: ${res.statusText}`);
    return res.json();
  }
};
