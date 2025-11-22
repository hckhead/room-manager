import type { User, Room, Resident, Contract, Payment, Expense } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
    USERS: 'goshiwon_users',
    ROOMS: 'goshiwon_rooms',
    RESIDENTS: 'goshiwon_residents',
    CONTRACTS: 'goshiwon_contracts',
    PAYMENTS: 'goshiwon_payments',
    EXPENSES: 'goshiwon_expenses',
};

// Helper to get data
const get = <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

// Helper to set data
const set = (key: string, data: any[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
    users: {
        getAll: () => get<User>(STORAGE_KEYS.USERS),
        findByUsername: (username: string) => get<User>(STORAGE_KEYS.USERS).find(u => u.username === username),
        create: (user: Omit<User, 'id'>) => {
            const users = get<User>(STORAGE_KEYS.USERS);
            const newUser = { ...user, id: uuidv4() };
            set(STORAGE_KEYS.USERS, [...users, newUser]);
            return newUser;
        }
    },
    rooms: {
        getAll: (ownerId: string) => get<Room>(STORAGE_KEYS.ROOMS).filter(r => r.ownerId === ownerId),
        get: (id: string) => get<Room>(STORAGE_KEYS.ROOMS).find(r => r.id === id),
        update: (room: Room) => {
            const rooms = get<Room>(STORAGE_KEYS.ROOMS);
            const index = rooms.findIndex(r => r.id === room.id);
            if (index >= 0) {
                rooms[index] = room;
                set(STORAGE_KEYS.ROOMS, rooms);
            } else {
                // Create if not exists (upsert-ish)
                set(STORAGE_KEYS.ROOMS, [...rooms, room]);
            }
        },
        batchUpdate: (newRooms: Room[]) => {
            const allRooms = get<Room>(STORAGE_KEYS.ROOMS);
            // Remove old versions of these rooms
            const otherRooms = allRooms.filter(r => !newRooms.some(nr => nr.id === r.id));
            set(STORAGE_KEYS.ROOMS, [...otherRooms, ...newRooms]);
        },
        create: (room: Omit<Room, 'id'>) => {
            const rooms = get<Room>(STORAGE_KEYS.ROOMS);
            const newRoom = { ...room, id: uuidv4() };
            set(STORAGE_KEYS.ROOMS, [...rooms, newRoom]);
            return newRoom;
        },
        delete: (id: string) => {
            const rooms = get<Room>(STORAGE_KEYS.ROOMS);
            set(STORAGE_KEYS.ROOMS, rooms.filter(r => r.id !== id));
        }
    },
    contracts: {
        getActive: (roomId: string) => {
            return get<Contract>(STORAGE_KEYS.CONTRACTS).find(c => c.roomId === roomId && c.isActive);
        },
        getAll: () => {
            return get<Contract>(STORAGE_KEYS.CONTRACTS);
        },
        getByRoom: (roomId: string) => {
            return get<Contract>(STORAGE_KEYS.CONTRACTS).filter(c => c.roomId === roomId);
        },
        getByResident: (residentId: string) => {
            return get<Contract>(STORAGE_KEYS.CONTRACTS).filter(c => c.residentId === residentId);
        },
        create: (contract: Omit<Contract, 'id'>) => {
            const contracts = get<Contract>(STORAGE_KEYS.CONTRACTS);
            const newContract = { ...contract, id: uuidv4() };
            set(STORAGE_KEYS.CONTRACTS, [...contracts, newContract]);
            return newContract;
        },
        update: (contract: Contract) => {
            const contracts = get<Contract>(STORAGE_KEYS.CONTRACTS);
            const index = contracts.findIndex(c => c.id === contract.id);
            if (index >= 0) {
                contracts[index] = contract;
                set(STORAGE_KEYS.CONTRACTS, contracts);
            }
        },
        delete: (id: string) => {
            const contracts = get<Contract>(STORAGE_KEYS.CONTRACTS);
            set(STORAGE_KEYS.CONTRACTS, contracts.filter(c => c.id !== id));
        }
    },
    residents: {
        get: (id: string) => get<Resident>(STORAGE_KEYS.RESIDENTS).find(r => r.id === id),
        getAll: () => get<Resident>(STORAGE_KEYS.RESIDENTS),
        create: (resident: Omit<Resident, 'id'>) => {
            const residents = get<Resident>(STORAGE_KEYS.RESIDENTS);
            const newResident = { ...resident, id: uuidv4() };
            set(STORAGE_KEYS.RESIDENTS, [...residents, newResident]);
            return newResident;
        },
        update: (resident: Resident) => {
            const residents = get<Resident>(STORAGE_KEYS.RESIDENTS);
            const index = residents.findIndex(r => r.id === resident.id);
            if (index >= 0) {
                residents[index] = resident;
                set(STORAGE_KEYS.RESIDENTS, residents);
            }
        },
        delete: (id: string) => {
            const residents = get<Resident>(STORAGE_KEYS.RESIDENTS);
            set(STORAGE_KEYS.RESIDENTS, residents.filter(r => r.id !== id));
        }
    },
    payments: {
        getAll: () => get<Payment>(STORAGE_KEYS.PAYMENTS),
        getByMonth: (month: string) => get<Payment>(STORAGE_KEYS.PAYMENTS).filter(p => p.month === month),
        getByResident: (residentId: string) => get<Payment>(STORAGE_KEYS.PAYMENTS).filter(p => p.residentId === residentId),
        getByContract: (contractId: string) => get<Payment>(STORAGE_KEYS.PAYMENTS).filter(p => p.contractId === contractId),
        create: (payment: Omit<Payment, 'id'>) => {
            const payments = get<Payment>(STORAGE_KEYS.PAYMENTS);
            const newPayment = { ...payment, id: uuidv4() };
            set(STORAGE_KEYS.PAYMENTS, [...payments, newPayment]);
            return newPayment;
        },
        update: (payment: Payment) => {
            const payments = get<Payment>(STORAGE_KEYS.PAYMENTS);
            const index = payments.findIndex(p => p.id === payment.id);
            if (index >= 0) {
                payments[index] = payment;
                set(STORAGE_KEYS.PAYMENTS, payments);
            }
        },
        delete: (id: string) => {
            const payments = get<Payment>(STORAGE_KEYS.PAYMENTS);
            set(STORAGE_KEYS.PAYMENTS, payments.filter(p => p.id !== id));
        }
    },
    expenses: {
        getAll: () => get<Expense>(STORAGE_KEYS.EXPENSES),
        getByDateRange: (start: string, end: string) => {
            return get<Expense>(STORAGE_KEYS.EXPENSES).filter(e => {
                return e.date >= start && e.date <= end;
            });
        },
        getByCategory: (category: Expense['category']) => {
            return get<Expense>(STORAGE_KEYS.EXPENSES).filter(e => e.category === category);
        },
        create: (expense: Omit<Expense, 'id'>) => {
            const expenses = get<Expense>(STORAGE_KEYS.EXPENSES);
            const newExpense = { ...expense, id: uuidv4() };
            set(STORAGE_KEYS.EXPENSES, [...expenses, newExpense]);
            return newExpense;
        },
        update: (expense: Expense) => {
            const expenses = get<Expense>(STORAGE_KEYS.EXPENSES);
            const index = expenses.findIndex(e => e.id === expense.id);
            if (index >= 0) {
                expenses[index] = expense;
                set(STORAGE_KEYS.EXPENSES, expenses);
            }
        },
        delete: (id: string) => {
            const expenses = get<Expense>(STORAGE_KEYS.EXPENSES);
            set(STORAGE_KEYS.EXPENSES, expenses.filter(e => e.id !== id));
        }
    },
    // Backup all data
    backup: () => {
        const data: Record<string, any> = {};
        Object.values(STORAGE_KEYS).forEach(key => {
            data[key] = get(key);
        });
        return data;
    },
    // Restore data
    restore: (data: Record<string, any>) => {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                if (data[key]) {
                    set(key, data[key]);
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to restore data:', error);
            return false;
        }
    },
    // Seed initial data for testing
    seed: () => {
        if (get(STORAGE_KEYS.USERS).length === 0) {
            const demoUser = { id: 'demo-user-id', username: 'admin', name: '홍길동', role: 'ADMIN' as const };
            set(STORAGE_KEYS.USERS, [demoUser]);

            // Create some demo rooms - only 3 for clean initial view
            const demoRooms: Room[] = [
                {
                    id: uuidv4(),
                    ownerId: 'demo-user-id',
                    number: '201',
                    floor: 2,
                    type: 'EN_SUITE',
                    status: 'OCCUPIED',
                    basePrice: 350000,
                    x: 20,
                    y: 20,
                    positionX: 0,
                    positionY: 0
                },
                {
                    id: uuidv4(),
                    ownerId: 'demo-user-id',
                    number: '202',
                    floor: 2,
                    type: 'WINDOW',
                    status: 'VACANT',
                    basePrice: 360000,
                    x: 240,
                    y: 20,
                    positionX: 1,
                    positionY: 0
                },
                {
                    id: uuidv4(),
                    ownerId: 'demo-user-id',
                    number: '203',
                    floor: 2,
                    type: 'WINDOW',
                    status: 'VACANT',
                    basePrice: 370000,
                    x: 460,
                    y: 20,
                    positionX: 2,
                    positionY: 0
                }
            ];
            set(STORAGE_KEYS.ROOMS, demoRooms);
        }
    }
};
