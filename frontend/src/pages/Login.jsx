import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, Stethoscope, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [role, setRole] = useState('Doctor'); // 'Admin', 'Doctor', 'Patient'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorPrompt('');
    
    try {
      if (role === 'Patient') {
        if (!otpSent) {
          // Request OTP
          const res = await fetch('http://localhost:5000/api/patients/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone })
          });
          if (res.ok) {
            setOtpSent(true);
          } else {
            const data = await res.json();
            setErrorPrompt(data.message || 'Error occurred');
          }
          return;
        } else {
          // Verify OTP
          const res = await fetch('http://localhost:5000/api/patients/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, otp })
          });
          if (res.ok) {
            const data = await res.json();
            login({ ...data.patient, role: 'Patient', token: data.token });
            navigate('/');
          } else {
            const data = await res.json();
            setErrorPrompt(data.message || 'Invalid OTP');
          }
        }
      } else {
        // Admin or Doctor Login
        const endpoint = role === 'Admin' ? 'admin' : 'doctor';
        const res = await fetch(`http://localhost:5000/api/${endpoint}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hospitalEmail: email, password })
        });
        
        if (res.ok) {
          const data = await res.json();
          const userObj = role === 'Admin' ? data.admin : data.doctor;
          login({ ...userObj, role, token: data.token });
          navigate('/');
        } else {
          const data = await res.json();
          setErrorPrompt(data.message || 'Invalid credentials');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorPrompt('Network error, please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Activity size={32} color="var(--primary-color)" />
          </div>
          <h2 style={{marginTop: '1rem', color: 'var(--primary-color)'}}>EHR Portal Login</h2>
          <p style={{color: 'var(--text-muted)'}}>Select your role to continue</p>
        </div>

        {/* Role Selection */}
        <div style={styles.roleContainer}>
          <button type="button" style={role === 'Admin' ? {...styles.roleBtn, ...styles.activeRole} : styles.roleBtn} onClick={() => setRole('Admin')}>
            <ShieldCheck size={20} />
            <span>Admin</span>
          </button>
          <button type="button" style={role === 'Doctor' ? {...styles.roleBtn, ...styles.activeRole} : styles.roleBtn} onClick={() => setRole('Doctor')}>
            <Stethoscope size={20} />
            <span>Doctor</span>
          </button>
          <button type="button" style={role === 'Patient' ? {...styles.roleBtn, ...styles.activeRole} : styles.roleBtn} onClick={() => { setRole('Patient'); setOtpSent(false); }}>
            <User size={20} />
            <span>Patient</span>
          </button>
        </div>
        
        {errorPrompt && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{errorPrompt}</div>}
        
        <form onSubmit={handleLogin}>
          {(role === 'Admin' || role === 'Doctor') && (
            <>
              <div className="form-group">
                <label className="form-label">Hospital Email ID</label>
                <input type="email" className="form-input" placeholder={role === 'Admin' ? "admin@hospital.com" : "doctor@hospital.com"} value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem'}}>
                Login
              </button>
              {role === 'Admin' && (
                <div style={{textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem'}}>
                  <span style={{color: 'var(--text-muted)'}}>New Hospital? </span>
                  <Link to="/admin/register" style={{color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none'}}>Register Admin</Link>
                </div>
              )}
            </>
          )}

          {role === 'Patient' && (
            <>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" placeholder="Enter 10 digit number" value={phone} onChange={(e) => setPhone(e.target.value)} required readOnly={otpSent} />
              </div>
              {otpSent && (
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <input type="text" className="form-input" placeholder="Enter 6 digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                </div>
              )}
              <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem'}}>
                {otpSent ? 'Verify & Login' : 'Send OTP'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-light)', padding: '1rem' },
  loginCard: { width: '100%', maxWidth: '430px', padding: '2.5rem 2rem' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  iconCircle: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  roleContainer: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '2rem' },
  roleBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.8rem 0.5rem', backgroundColor: '#f1f5f9', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s', fontSize: '0.85rem', fontWeight: '500' },
  activeRole: { backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary-color)', color: 'var(--primary-color)', boxShadow: '0 0 0 1px var(--primary-color)' }
};

export default Login;
