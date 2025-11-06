import { getFromStorage, setToStorage } from './core';

export interface BodyMetric {
  id: number;
  memberId: number;
  memberName: string;
  date: Date;
  weight: number; // kg
  height?: number; // cm
  bodyFat?: number; // percentage
  muscleMass?: number; // kg
  bmi?: number;
  chest?: number; // cm
  waist?: number; // cm
  hips?: number; // cm
  biceps?: number; // cm
  thighs?: number; // cm
  notes?: string;
  photos?: string[]; // URLs to progress photos
  createdAt: Date;
}

const BODY_METRICS_KEY = 'body_metrics';

export const getBodyMetrics = async (): Promise<BodyMetric[]> => {
  return await getFromStorage<BodyMetric>(BODY_METRICS_KEY);
};

export const getMemberBodyMetrics = async (memberId: number): Promise<BodyMetric[]> => {
  const allMetrics = await getBodyMetrics();
  return allMetrics
    .filter(m => m.memberId === memberId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const saveBodyMetric = async (metric: Omit<BodyMetric, 'id' | 'createdAt' | 'bmi'>): Promise<boolean> => {
  try {
    const metrics = await getBodyMetrics();
    
    // Calculate BMI if height and weight are provided
    let bmi: number | undefined;
    if (metric.height && metric.weight) {
      const heightInMeters = metric.height / 100;
      bmi = Number((metric.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    
    const newMetric: BodyMetric = {
      ...metric,
      id: Date.now(),
      bmi,
      createdAt: new Date(),
    };
    
    metrics.push(newMetric);
    await setToStorage(BODY_METRICS_KEY, metrics);
    return true;
  } catch (error) {
    console.error('Error saving body metric:', error);
    return false;
  }
};

export const updateBodyMetric = async (id: number, updates: Partial<BodyMetric>): Promise<boolean> => {
  try {
    const metrics = await getBodyMetrics();
    const index = metrics.findIndex(m => m.id === id);
    
    if (index !== -1) {
      const updated = { ...metrics[index], ...updates };
      
      // Recalculate BMI if height or weight changed
      if (updated.height && updated.weight) {
        const heightInMeters = updated.height / 100;
        updated.bmi = Number((updated.weight / (heightInMeters * heightInMeters)).toFixed(1));
      }
      
      metrics[index] = updated;
      await setToStorage(BODY_METRICS_KEY, metrics);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating body metric:', error);
    return false;
  }
};

export const deleteBodyMetric = async (id: number): Promise<boolean> => {
  try {
    const metrics = await getBodyMetrics();
    const filtered = metrics.filter(m => m.id !== id);
    await setToStorage(BODY_METRICS_KEY, filtered);
    return true;
  } catch (error) {
    console.error('Error deleting body metric:', error);
    return false;
  }
};

export const getLatestBodyMetric = async (memberId: number): Promise<BodyMetric | null> => {
  const memberMetrics = await getMemberBodyMetrics(memberId);
  return memberMetrics.length > 0 ? memberMetrics[0] : null;
};
