import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduleItem } from '@/types/schedule';

const SCHEDULE_STORAGE_KEY = '@schedule_items';

// Memory cache to reduce AsyncStorage reads
let scheduleCache: ScheduleItem[] | null = null;
let isCacheValid = false;

export const scheduleStorage = {
  async getAll(): Promise<ScheduleItem[]> {
    // Return cached data if available
    if (isCacheValid && scheduleCache !== null) {
      return scheduleCache;
    }
    
    try {
      const jsonValue = await AsyncStorage.getItem(SCHEDULE_STORAGE_KEY);
      const items = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      // Update cache
      scheduleCache = items;
      isCacheValid = true;
      
      return items;
    } catch (e) {
      console.error('Error loading schedule:', e);
      return [];
    }
  },

  async save(items: ScheduleItem[]): Promise<void> {
    try {
      // Update cache immediately (optimistic update)
      scheduleCache = items;
      isCacheValid = true;
      
      const jsonValue = JSON.stringify(items);
      await AsyncStorage.setItem(SCHEDULE_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving schedule:', e);
      // Invalidate cache on error
      isCacheValid = false;
      throw e;
    }
  },

  async add(item: ScheduleItem): Promise<void> {
    const items = await this.getAll();
    items.push(item);
    await this.save(items);
  },

  async update(id: string, updatedItem: ScheduleItem): Promise<void> {
    const items = await this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = updatedItem;
      await this.save(items);
    }
  },

  async delete(id: string): Promise<void> {
    const items = await this.getAll();
    const filtered = items.filter(item => item.id !== id);
    await this.save(filtered);
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SCHEDULE_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing schedule:', e);
    }
  }
};
