export type UserRole = 'ADMIN' | 'MANAGER';

export interface User {
    id: string;
    username: string;
    name: string;
    role: UserRole;
}

export type RoomStatus = 'VACANT' | 'OCCUPIED' | 'LEAVING_SOON' | 'RESERVED' | 'MAINTENANCE';

export type RoomType = 'WINDOW' | 'NO_WINDOW' | 'EN_SUITE' | 'DUPLEX';

export interface Room {
    id: string;
    ownerId: string;
    number: string;
    floor: number;
    type: RoomType;
    status: RoomStatus;
    basePrice: number;
    // Canvas Layout Coordinates (px)
    x: number;
    y: number;
    width?: number;
    height?: number;
    // Legacy Grid (optional)
    positionX?: number;
    positionY?: number;
}

export interface Resident {
    id: string;
    name: string;
    phone: string;
    emergencyPhone?: string;
    memo?: string;
    idCardImage?: string; // Base64 or URL
}

export interface Contract {
    id: string;
    roomId: string;
    residentId: string;
    startDate: string; // ISO Date
    endDate: string; // ISO Date
    actualLeaveDate?: string; // ISO Date
    deposit: number;
    rent: number;
    managementFee: number;
    paymentDay: number; // 1-31
    isActive: boolean;
}

// Combined type for Dashboard display
export interface RoomWithContract extends Room {
    resident?: Resident;
    currentContract?: Contract;
}

export interface Payment {
    id: string;
    contractId: string;
    residentId: string;
    roomId: string;
    month: string; // Format: "2024-11"
    amount: number; // Expected amount (rent + management fee)
    paidAmount: number; // Actual amount paid
    paidDate: string | null; // Date payment was received
    status: 'PAID' | 'UNPAID' | 'PARTIAL' | 'OVERDUE';
    memo: string;
    createdAt: string;
}

export interface Expense {
    id: string;
    category: 'UTILITY' | 'MAINTENANCE' | 'REPAIR' | 'OTHER';
    subcategory: string; // e.g., "전기", "수도", "가스", "수리"
    amount: number;
    date: string;
    description: string;
    memo: string;
    createdAt: string;
}
