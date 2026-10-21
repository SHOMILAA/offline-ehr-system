import React, { createContext, useState, useEffect, useContext } from 'react';
import { initDB } from '../db';
import { syncOfflineData } from '../utils/syncManager';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            // Load saved user
            const savedUser = localStorage.getItem('ehr_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            
            // Init SQLite
            try {
                await initDB();
            } catch (err) {
                console.error("Offline DB Init Failed", err);
            }
            
            setLoading(false);
        };
        init();

        // Automatic sync every 2 minutes
        const syncInterval = setInterval(async () => {
            try {
                if (navigator.onLine) {
                    await syncOfflineData();
                }
            } catch(e) {
                console.error('Auto sync failed', e);
            }
        }, 120000);

        return () => clearInterval(syncInterval);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('ehr_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ehr_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
