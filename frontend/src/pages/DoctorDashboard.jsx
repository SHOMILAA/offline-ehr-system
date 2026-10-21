import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { clearDB } from '../db';
import { syncOfflineData } from '../utils/syncManager';
import { Activity } from 'lucide-react';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [syncStatus, setSyncStatus] = useState('');

    const handleSync = async () => {
        setSyncStatus('Syncing...');
        const res = await syncOfflineData();
        setSyncStatus(res.message);
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Activity size={32} color="var(--primary-color)" />
                <h1 style={{ color: 'var(--primary-color)' }}>Doctor Dashboard</h1>
            </div>
            
            <p>Welcome, Dr. {user?.name}!</p>

            <div style={{ marginTop: '2rem' }}>
                <button 
                  className="btn" 
                  onClick={handleSync}
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                    Sync Offline Data to Cloud
                </button>
                {syncStatus && <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{syncStatus}</p>}
            </div>
        </div>
    );
};

export default DoctorDashboard;
