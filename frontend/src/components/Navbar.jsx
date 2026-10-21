import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Users, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('ehr_user');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.logoSection}>
          <Activity size={28} color="white" />
          <span style={styles.logoText}>Offline EHR</span>
        </div>
        
        <ul style={styles.navLinks}>
          <li>
            <NavLink 
              to="/" 
              style={({ isActive }) => isActive ? {...styles.link, ...styles.activeLink} : styles.link}
              end
            >
              Home
            </NavLink>
          </li>
          
          {user?.role !== 'Patient' && (
            <>
              <li>
                <NavLink 
                  to="/add-patient" 
                  style={({ isActive }) => isActive ? {...styles.link, ...styles.activeLink} : styles.link}
                >
                  <PlusCircle size={18} />
                  Add Patient
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/patients" 
                  style={({ isActive }) => isActive ? {...styles.link, ...styles.activeLink} : styles.link}
                >
                  <Users size={18} />
                  Patients
                </NavLink>
              </li>
            </>
          )}

          <li>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={18} />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: 'var(--primary-color)',
    padding: '1rem 2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    color: 'white'
  },
  logoText: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    letterSpacing: '0.5px'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    margin: 0,
    padding: 0
  },
  link: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'color 0.2s',
    padding: '0.5rem 0'
  },
  activeLink: {
    color: 'white',
    borderBottom: '2px solid white'
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer',
    padding: '0.5rem 0',
    fontSize: '1rem',
    transition: 'color 0.2s'
  }
};

export default Navbar;
