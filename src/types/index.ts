export interface Patient {
  id: string;
  name: string;
  mobile: string;
  city: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
}

export type PatientStatus = 
  | 'onboarded'
  | 'on-hold'
  | 'future'
  | 'delivered'
  | 'stock-out'
  | 'archived';

export interface User {
  username: string;
  name: string;
}

export interface OnboardingData {
  name: string;
  mobile: string;
  city: string;
}

export interface Medicine {
  id: string;
  name: string;
  quantity: number;
  photo?: string;
  deliveredQuantity: number;
  dailyUsage: number;
}

export interface ShippingAddress {
  address: string;
  lat: number;
  lng: number;
}

export interface PatientDetails extends Patient {
  prescriptionFile?: string;
  medicines: Medicine[];
  pendingAmount: number;
  pendingAmounts: PendingAmount[];
  shippingAddress?: ShippingAddress;
}

export interface PendingAmount {
  id: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}