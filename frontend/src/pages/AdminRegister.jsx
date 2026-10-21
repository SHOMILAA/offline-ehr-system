import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import axios from 'axios';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    name: '',
    hospitalEmail: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const { hospitalName, name, hospitalEmail, password, confirmPassword } = formData;
    if (!hospitalName || !name || !hospitalEmail || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/admin/register', {
        hospitalName,
        name,
        hospitalEmail,
        password
      });
      alert('Admin registered successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.registerCard}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Activity size={32} color="var(--primary-color)" />
          </div>
          <h2 style={{marginTop: '1rem', color: 'var(--primary-color)'}}>Admin Registration</h2>
          <p style={{color: 'var(--text-muted)'}}>Onboard your hospital safely</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Hospital Name</label>
            <input 
              type="text" 
              name="hospitalName"
              className="form-input" 
              placeholder="E.g. City General Hospital"
              value={formData.hospitalName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Admin Name</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Hospital Email ID</label>
            <input 
              type="email" 
              name="hospitalEmail"
              className="form-input" 
              placeholder="admin@hospital.com"
              value={formData.hospitalEmail}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              className="form-input" 
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem'}} disabled={loading}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--primary-light)',
    padding: '2rem 1rem'
  },
  registerCard: {
    width: '100%',
    maxWidth: '430px',
    padding: '2.5rem 2rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '0.8rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    border: '1px solid #fecaca'
  }
};

export default AdminRegister;
