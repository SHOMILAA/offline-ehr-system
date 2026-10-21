import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchPatients = () => {
    axios.get('http://localhost:5000/api/patients')
      .then(res => setPatients(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this patient record?")) {
      if (!navigator.onLine) {
          import('../db').then(({ deleteOfflinePatient }) => {
              deleteOfflinePatient(id);
              alert("You are offline. Patient deleted locally and will sync when online.");
              setPatients(prev => prev.filter(p => p._id !== id && p.id !== id));
          });
          return;
      }
      axios.delete(`http://localhost:5000/api/patients/${id}`)
        .then(() => fetchPatients())
        .catch(err => console.error(err));
    }
  };

  const filteredPatients = patients.filter(patient => {
    const pName = patient.patientName || patient.name || '';
    return pName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <h1 className="page-title">Patient Directory</h1>
      
      <div className="card" style={{marginBottom: '1.5rem', padding: '1rem 1.5rem'}}>
        <div style={styles.searchBar}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by patient name..." 
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age/Gender</th>
              <th>Village</th>
              <th>Last Visit</th>
              <th>Diagnosis</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient._id || patient.id}>
                  <td style={{fontWeight: '500'}}>{patient.patientName || patient.name}</td>
                  <td>{patient.age} / {patient.gender}</td>
                  <td>{patient.village}</td>
                  <td>{patient.visitDate ? new Date(patient.visitDate).toLocaleDateString() : ''}</td>
                  <td>{patient.diagnosis}</td>
                  <td style={{textAlign: 'right'}}>
                    <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '0.4rem'}} 
                        title="View"
                        onClick={() => navigate(`/patients/${patient._id || patient.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '0.4rem', color: '#0284c7', borderColor: '#0284c7'}} 
                        title="Edit"
                        onClick={() => navigate(`/patients/${patient._id || patient.id}/edit`)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{padding: '0.4rem'}} 
                        title="Delete"
                        onClick={() => handleDelete(patient._id || patient.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    width: '100%'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    fontFamily: 'inherit',
    color: 'var(--text-main)',
    backgroundColor: 'transparent'
  }
};

export default PatientList;
