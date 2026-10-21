import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [docEmail, setDocEmail] = useState('');
    const [docPassword, setDocPassword] = useState('');
    const [docName, setDocName] = useState('');
    const [docSpec, setDocSpec] = useState('');
    const [status, setStatus] = useState('');

    const handleRegisterDoctor = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/doctor/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: docName,
                    hospitalEmail: docEmail,
                    password: docPassword,
                    specialization: docSpec,
                    hospitalName: user?.hospitalName || 'General Hospital'
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('Doctor Registered Successfully!');
                setDocEmail(''); setDocPassword(''); setDocName(''); setDocSpec('');
            } else {
                setStatus(data.message || 'Error occurred');
            }
        } catch (error) {
            setStatus('Network Error');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <ShieldCheck size={32} color="var(--primary-color)" />
                <h1 style={{ color: 'var(--primary-color)' }}>Admin Dashboard</h1>
            </div>
            
            <p>Welcome Admin, {user?.name}!</p>
            
            <div className="card" style={{ maxWidth: '500px', marginTop: '2rem' }}>
                <h3>Register a New Doctor</h3>
                <form onSubmit={handleRegisterDoctor} style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input className="form-input" value={docName} onChange={e => setDocName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-input" value={docEmail} onChange={e => setDocEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Specialization</label>
                        <input className="form-input" value={docSpec} onChange={e => setDocSpec(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" value={docPassword} onChange={e => setDocPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
                    {status && <p style={{ marginTop: '1rem', textAlign: 'center' }}>{status}</p>}
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
