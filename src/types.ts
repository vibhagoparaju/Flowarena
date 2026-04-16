export type ZoneId = 'North' | 'South' | 'East' | 'West';

export interface ZoneData {
  id: ZoneId;
  density: number; // 0 to 100
  capacity: number;
  occupancy: number;
  status: 'Normal' | 'Warning' | 'Critical';
  predictedDensity: number; // T+5 min
}

export interface FanState {
  id: string;
  name: string;
  gate: string;
  zone: ZoneId;
  seat: string;
  arrivalProgress: number; // 0 to 1
  foodOrder?: {
    status: 'Idle' | 'Preparing' | 'Ready' | 'Collected';
    stand: string;
    items: string[];
    pickupWindow?: string;
  };
}

export interface Incident {
  id: string;
  type: 'Crowd Pressure' | 'Medical' | 'Security';
  location: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Reported' | 'Dispatched' | 'Resolved';
  timestamp: string;
}

export interface AIInsight {
  title: string;
  content: string;
  action?: string;
  severity: 'info' | 'warning' | 'critical';
}
