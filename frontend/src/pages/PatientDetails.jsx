import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Activity, Calendar, Pill, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getOfflineHistories, getOfflinePatients } from '../db';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processLegacyHistory = (pat, hist) => {
        if (hist.length === 0 && pat && (pat.symptoms || pat.diagnosis || pat.bloodPressure)) {
            hist.push({
                _id: 'legacy_' + (pat._id || pat.id),
                visitDate: pat.visitDate || pat.createdAt,
                nextVisit: pat.nextVisit,
                symptoms: pat.symptoms,
                diagnosis: pat.diagnosis,
                medicines: pat.medicines,
                doctorNotes: pat.doctorNotes,
                allergies: pat.allergies,
                bloodPressure: pat.bloodPressure,
                temperature: pat.temperature,
                heartRate: pat.heartRate,
                legacy: true
            });
        }
        return hist;
    };

    if (!navigator.onLine) {
        // offline logic
        const localPatients = getOfflinePatients();
        const found = localPatients.find(p => p.mongoId === id || p.id === parseInt(id));
        setPatient(found || null);
        
        const localHistories = getOfflineHistories();
        let patientHists = localHistories.filter(h => h.patientId === id || h.patientId === parseInt(id));
        if (found) patientHists = processLegacyHistory(found, patientHists);

        setHistory(patientHists);
        setLoading(false);
        return;
    }

    Promise.all([
      axios.get(`http://localhost:5000/api/patients/${id}`),
      axios.get(`http://localhost:5000/api/patients/${id}/visits`)
    ])
    .then(async ([patientRes, historyRes]) => {
      setPatient(patientRes.data);
      let hist = historyRes.data;
      hist = processLegacyHistory(patientRes.data, hist);
      
      try {
          const { getOfflineHistories } = await import('../db');
          const localHistories = getOfflineHistories();
          const unsyncedHists = localHistories.filter(h => h.patientId === id || h.patientId === parseInt(id));
          if (unsyncedHists.length > 0) {
              hist = [...unsyncedHists, ...hist];
              hist.sort((a,b) => new Date(b.visitDate) - new Date(a.visitDate));
          }
      } catch (e) {
          console.error("Failed to merge offline histories", e);
      }

      setHistory(hist);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this patient record?")) {
      if (!navigator.onLine) {
          alert("Cannot delete while offline. Please connect to internet to delete.");
          return;
      }
      axios.delete(`http://localhost:5000/api/patients/${id}`)
        .then(() => navigate('/patients'))
        .catch(err => console.error(err));
    }
  };

  if (loading) return <div>Loading patient details...</div>;
  if (!patient) return <div>Patient not found.</div>;

  const isDoctor = user?.role === 'Doctor';
  const latestVisit = history.length > 0 ? history[0] : null;

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button className="btn btn-outline" onClick={() => navigate(-1)} style={{padding: '0.4rem 0.8rem'}}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="page-title" style={{margin: 0}}>Patient Details</h1>
        </div>
        
        {isDoctor && (
          <div style={{display: 'flex', gap: '0.8rem'}}>
            <button className="btn" onClick={() => navigate(`/patients/${id}/add-visit`)} style={{padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
              <Plus size={18} /> Add Visit
            </button>
            <button className="btn btn-outline" onClick={() => navigate(`/patients/${id}/edit`)} style={{color: '#0284c7', borderColor: '#0284c7', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
              <Edit size={18} /> Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete} style={{padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
              <Trash2 size={18} /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{marginBottom: '1.5rem'}}>
        <div style={styles.headerSection}>
          <div style={styles.avatar}>
            <User size={40} color="var(--primary-color)" />
          </div>
          <div>
            <h2 style={{fontSize: '1.6rem', marginBottom: '0.3rem'}}>{patient.patientName || patient.name}</h2>
            <div style={styles.badges}>
              <span style={styles.badge}>{patient.phoneNumber}</span>
              <span style={styles.badge}>{patient.age} years old</span>
              <span style={styles.badge}>{patient.gender}</span>
              <span style={styles.badge}>Blood: {patient.bloodGroup}</span>
              <span style={styles.badge}><MapPin size={14}/> {patient.village}</span>
            </div>
            <div style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <strong>Hospital:</strong> {patient.hospitalName} | <strong>Assigned Doctor:</strong> {patient.assignedDoctor}
            </div>
          </div>
        </div>
      </div>

      <h2 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)'}}>Current / Latest Medical Info</h2>
      <div style={{...styles.grid, marginBottom: '2rem'}}>
        <div className="card">
          <h3 style={styles.sectionTitle}><Activity size={20}/> Vitals & Info (Latest)</h3>
          <div style={styles.infoRow}><strong>Blood Pressure:</strong> {latestVisit?.bloodPressure || patient.bloodPressure || 'N/A'}</div>
          <div style={styles.infoRow}><strong>Temperature:</strong> {latestVisit?.temperature ? `${latestVisit.temperature}°F` : (patient.temperature ? `${patient.temperature}°F` : 'N/A')}</div>
          <div style={styles.infoRow}><strong>Heart Rate:</strong> {latestVisit?.heartRate ? `${latestVisit.heartRate} bpm` : (patient.heartRate ? `${patient.heartRate} bpm` : 'N/A')}</div>
          <div style={styles.infoRow}><strong>Allergies:</strong> {latestVisit?.allergies || patient.allergies || 'None recorded'}</div>
        </div>
      </div>

      <h2 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)'}}>Medical Visit History</h2>
      
      {history.length === 0 ? (
        <div className="card" style={{color: 'var(--text-muted)', textAlign: 'center'}}>No additional medical visits recorded for this patient.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {history.map((visit, index) => (
            <div className="card" key={visit._id || visit.id || index} style={{ borderLeft: '4px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Visit Date: {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString() : 'Unknown'}</h3>
                {visit.nextVisit && <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Next Visit: {new Date(visit.nextVisit).toLocaleDateString()}</span>}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>Symptoms:</strong>
                  <p style={styles.textBlock}>{visit.symptoms}</p>
                </div>
                <div>
                  <strong>Diagnosis:</strong>
                  <p style={styles.textBlock}>{visit.diagnosis}</p>
                </div>
                <div>
                  <strong>Medicines:</strong>
                  <p style={styles.textBlock}>{visit.medicines}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <strong>Vitals:</strong>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    BP: {visit.bloodPressure || 'N/A'} | Temp: {visit.temperature ? `${visit.temperature}°F` : 'N/A'} | HR: {visit.heartRate ? `${visit.heartRate} bpm` : 'N/A'}
                  </div>
                </div>
                <div>
                  <strong>Allergies:</strong>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{visit.allergies || 'N/A'}</div>
                </div>
                <div>
                  <strong>Doctor Notes:</strong>
                  <p style={{...styles.textBlock, marginTop: '0.5rem', minHeight: 'auto'}}>{visit.doctorNotes || 'None'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  headerSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badges: {
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-secondary)',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--primary-color)',
    marginBottom: '1rem',
    fontSize: '1.1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--border-color)'
  },
  infoRow: {
    marginBottom: '1rem',
    lineHeight: '1.5'
  },
  textBlock: {
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    marginTop: '0.5rem',
    minHeight: '3rem'
  }
};

export default PatientDetails;
