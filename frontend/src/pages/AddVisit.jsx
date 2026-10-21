import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { addOfflineHistory } from '../db';

const AddVisit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    symptoms: '',
    diagnosis: '',
    medicines: '',
    doctorNotes: '',
    visitDate: new Date().toISOString().split('T')[0],
    nextVisit: '',
    allergies: '',
    bloodPressure: '',
    temperature: '',
    heartRate: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Sanitize payload to prevent Mongoose CastErrors on empty strings
    const payload = { ...formData };
    if (!payload.nextVisit) delete payload.nextVisit;
    if (!payload.temperature) delete payload.temperature;
    if (!payload.heartRate) delete payload.heartRate;
    
    // Attach credentials 
    payload.patientId = id;
    payload.doctorId = user?.id || 'Unknown Doctor';
    payload.hospitalName = user?.hospitalName || 'Unknown Hospital';

    if (!navigator.onLine) {
      addOfflineHistory(payload);
      alert("You are offline. Medical visit saved locally and will sync when online.");
      navigate(`/patients/${id}`);
      return;
    }

    axios.post(`http://localhost:5000/api/patients/${id}/visits`, payload)
      .then(() => {
        alert("Visit history added successfully!");
        navigate(`/patients/${id}`);
      })
      .catch(err => {
        console.error("Error adding visit", err);
        // Intercept network/connection errors for offline fallback
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
            import('../db').then(({ addOfflineHistory }) => {
                addOfflineHistory(payload);
                alert("Visit saved offline. It will sync when the connection is restored.");
                navigate(`/patients/${id}`);
            });
            return;
        }
        const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
        alert(`Failed to add visit: ${errMsg}`);
      });
  };

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{padding: '0.4rem 0.8rem'}}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="page-title" style={{margin: 0}}>Add Medical Visit</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          
          <div className="form-group">
            <label className="form-label">Visit Date</label>
            <input type="date" name="visitDate" className="form-input" value={formData.visitDate || ''} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Next Visit</label>
            <input type="date" name="nextVisit" className="form-input" value={formData.nextVisit || ''} onChange={handleChange} />
          </div>

          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label className="form-label">Symptoms</label>
            <textarea name="symptoms" className="form-input" rows="2" value={formData.symptoms || ''} onChange={handleChange} required></textarea>
          </div>

          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label className="form-label">Diagnosis / Disease</label>
            <textarea name="diagnosis" className="form-input" rows="2" value={formData.diagnosis || ''} onChange={handleChange} required></textarea>
          </div>

          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label className="form-label">Medicines</label>
            <textarea name="medicines" className="form-input" rows="2" value={formData.medicines || ''} onChange={handleChange} required></textarea>
          </div>

          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label className="form-label">Doctor Notes</label>
            <textarea name="doctorNotes" className="form-input" rows="2" value={formData.doctorNotes || ''} onChange={handleChange}></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Allergies</label>
            <input type="text" name="allergies" className="form-input" value={formData.allergies || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Blood Pressure</label>
            <input type="text" name="bloodPressure" className="form-input" placeholder="e.g. 120/80" value={formData.bloodPressure || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Temperature (°F)</label>
            <input type="number" step="0.1" name="temperature" className="form-input" placeholder="e.g. 98.6" value={formData.temperature || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Heart Rate (bpm)</label>
            <input type="number" name="heartRate" className="form-input" placeholder="e.g. 72" value={formData.heartRate || ''} onChange={handleChange} />
          </div>

          <div style={{gridColumn: '1 / -1', marginTop: '1rem'}}>
            <button type="submit" className="btn" style={{width: '100%', fontSize: '1.1rem', padding: '0.8rem'}}>
              <Save size={20} /> Save New Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    columnGap: '1.5rem',
  }
};

export default AddVisit;
