import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { updateOfflinePatient, getOfflinePatients } from '../db';

const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    age: '',
    gender: 'Male',
    bloodGroup: '',
    village: '',
    hospitalName: user?.hospitalName || '',
    assignedDoctor: user?.id || '',
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

  useEffect(() => {
    if (!navigator.onLine) {
        const localPatients = getOfflinePatients();
        const found = localPatients.find(p => p.mongoId === id || p.id === parseInt(id));
        if (found) {
            setFormData(prev => ({...prev, ...found}));
        } else {
            alert("Patient not found in offline storage.");
        }
        setLoading(false);
        return;
    }

    axios.get(`http://localhost:5000/api/patients/${id}`)
      .then(res => {
        const d = res.data;
        // Make sure date string extracts well for standard <input type="date" /> format
        if (d.visitDate) d.visitDate = new Date(d.visitDate).toISOString().split('T')[0];
        if (d.nextVisit) d.nextVisit = new Date(d.nextVisit).toISOString().split('T')[0];
        
        setFormData(prev => ({ ...prev, ...d }));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        alert("Failed to fetch patient data.");
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = { ...formData };
    if (!payload.nextVisit) delete payload.nextVisit;
    if (!payload.temperature) delete payload.temperature;
    if (!payload.heartRate) delete payload.heartRate;

    if (!navigator.onLine) {
      updateOfflinePatient(payload);
      alert("You are offline. Edits saved locally and will sync when online.");
      navigate(`/patients/${id}`);
      return;
    }

    axios.put(`http://localhost:5000/api/patients/${id}`, payload)
      .then(() => {
        alert("Patient updated successfully!");
        navigate(`/patients/${id}`);
      })
      .catch(err => {
        console.error("Error updating patient", err);
        const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
        alert(`Failed to update patient: ${errMsg}`);
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{padding: '0.4rem 0.8rem'}}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="page-title" style={{margin: 0}}>Edit Patient</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div className="form-group">
            <label className="form-label">Patient Name</label>
            <input type="text" name="patientName" className="form-input" value={formData.patientName || ''} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" name="phoneNumber" className="form-input" value={formData.phoneNumber || ''} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select name="bloodGroup" className="form-input" value={formData.bloodGroup || ''} onChange={handleChange} required>
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Age</label>
            <input type="number" name="age" className="form-input" value={formData.age || ''} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select name="gender" className="form-input" value={formData.gender || ''} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Village / Location</label>
            <input type="text" name="village" className="form-input" value={formData.village || ''} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Visit Date</label>
            <input type="date" name="visitDate" className="form-input" value={formData.visitDate || ''} onChange={handleChange} required />
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
            <label className="form-label">Next Visit</label>
            <input type="date" name="nextVisit" className="form-input" value={formData.nextVisit || ''} onChange={handleChange} />
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
              <Save size={20} /> Update Patient Record
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

export default EditPatient;
