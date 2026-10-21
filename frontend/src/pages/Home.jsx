import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Users, Wifi, RefreshCw, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const [totalPatients, setTotalPatients] = useState(0);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    // Fetch total patients from backend
    axios.get('http://localhost:5000/api/patients')
      .then(res => setTotalPatients(res.data.length))
      .catch(err => console.error("Could not fetch patients:", err));

    import('../db').then(({ getOfflinePatients, getOfflineHistories, getOfflineDeletes }) => {
        try {
            const patients = getOfflinePatients();
            const histories = getOfflineHistories();
            const deletes = getOfflineDeletes();
            const pendingPts = patients.filter(p => p.isNewRecord || p.isEdited).length;
            setPendingSync(pendingPts + histories.length + deletes.length);
        } catch(e) {
            console.error(e);
        }
    });
  }, []);

  const { user } = useAuth();
  if (user?.role === 'Patient') {
    return <Navigate to={`/patients/${user.id}`} replace />;
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 className="page-title">Welcome, Doctor</h1>
        <p style={{color: 'var(--text-muted)'}}>Offline Electronic Health Record System</p>
      </div>

      <div style={styles.grid}>
        <div className="card" style={styles.statCard}>
          <div style={{...styles.iconWrapper, backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)'}}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={styles.statValue}>{totalPatients}</h3>
            <p style={styles.statLabel}>Total Patients</p>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{...styles.iconWrapper, backgroundColor: '#dbeafe', color: '#3b82f6'}}>
            <Wifi size={24} />
          </div>
          <div>
            <h3 style={styles.statValue}>Online</h3>
            <p style={styles.statLabel}>Internet Status</p>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{...styles.iconWrapper, backgroundColor: '#fef3c7', color: '#d97706'}}>
            <RefreshCw size={24} />
          </div>
          <div>
            <h3 style={styles.statValue}>{pendingSync}</h3>
            <p style={styles.statLabel}>Pending Sync</p>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <h2 style={{marginBottom: '1rem', fontSize: '1.2rem'}}>Quick Actions</h2>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="btn" onClick={() => navigate('/add-patient')}>
            <UserPlus size={18} /> Add New Patient
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/patients')}>
            <Users size={18} /> View All Patients
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '2rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.5rem'
  },
  iconWrapper: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    lineHeight: 1.2
  },
  statLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  actions: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  }
};

export default Home;
