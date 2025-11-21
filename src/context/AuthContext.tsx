import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { db } from '../services/db';

interface AuthContextType {
    user: User | null;
    login: (username: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for existing session (simplified)
        const storedUserId = localStorage.getItem('goshiwon_current_user_id');
        if (storedUserId) {
            const users = db.users.getAll();
            const found = users.find(u => u.id === storedUserId);
            if (found) setUser(found);
        } else {
            // Auto-seed for demo if empty
            db.seed();
        }
    }, []);

    const login = async (username: string) => {
        const found = db.users.findByUsername(username);
        if (found) {
            setUser(found);
            localStorage.setItem('goshiwon_current_user_id', found.id);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('goshiwon_current_user_id');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
