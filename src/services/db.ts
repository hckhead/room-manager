import type { User, Room, Resident, Contract } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
    USERS: 'goshiwon_users',
    ROOMS: 'goshiwon_rooms',
    RESIDENTS: 'goshiwon_residents',
    CONTRACTS: 'goshiwon_contracts',
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
        }
    },
    contracts: {
        getActive: (roomId: string) => {
            return get<Contract>(STORAGE_KEYS.CONTRACTS).find(c => c.roomId === roomId && c.isActive);
        },
        create: (contract: Omit<Contract, 'id'>) => {
            const contracts = get<Contract>(STORAGE_KEYS.CONTRACTS);
            const newContract = { ...contract, id: uuidv4() };
            set(STORAGE_KEYS.CONTRACTS, [...contracts, newContract]);
            return newContract;
        }
    },
    residents: {
        get: (id: string) => get<Resident>(STORAGE_KEYS.RESIDENTS).find(r => r.id === id),
        create: (resident: Omit<Resident, 'id'>) => {
            const residents = get<Resident>(STORAGE_KEYS.RESIDENTS);
            const newResident = { ...resident, id: uuidv4() };
            set(STORAGE_KEYS.RESIDENTS, [...residents, newResident]);
            return newResident;
        }
    },
    // Seed initial data for testing
    seed: () => {
        if (get(STORAGE_KEYS.USERS).length === 0) {
            const demoUser = { id: 'demo-user-id', username: 'admin', name: '홍길동', role: 'ADMIN' as const };
            set(STORAGE_KEYS.USERS, [demoUser]);

            // Create some demo rooms
            const demoRooms: Room[] = Array.from({ length: 15 }).map((_, i) => ({
                id: uuidv4(),
                ownerId: 'demo-user-id',
                number: `${201 + i}`,
                floor: 2,
                type: i % 3 === 0 ? 'EN_SUITE' : 'WINDOW',
                status: i === 0 ? 'OCCUPIED' : i === 1 ? 'LEAVING_SOON' : 'VACANT',
                basePrice: 350000 + (i * 10000),
                x: (i % 5) * 220 + 20, // Initial layout
                y: Math.floor(i / 5) * 140 + 20,
                positionX: i % 4,
                positionY: Math.floor(i / 4)
            }));
            set(STORAGE_KEYS.ROOMS, demoRooms);
        }
    }
};
