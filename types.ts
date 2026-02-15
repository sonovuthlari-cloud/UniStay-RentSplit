
export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export enum PlanType {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PRO = 'PRO'
}

export interface Property {
  id: string;
  name: string;
  address: string;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  baseRent: number;
}

export interface Tenant {
  id: string;
  propertyId: string;
  roomId: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidDate?: string;
}

export interface AppState {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];
  subscription: {
    plan: PlanType;
    aiRemindersUsed: number;
  };
}
