import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import AddPatient from './pages/AddPatient';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import AdminRegister from './pages/AdminRegister';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EditPatient from './pages/EditPatient';
import AddVisit from './pages/AddVisit';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app-container">
        {/* We generally want the Navbar on all protected pages */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-content">
                  {user?.role === 'Admin' ? <AdminDashboard /> : 
                   user?.role === 'Doctor' ? <DoctorDashboard /> : 
                   <Home />}
                </main>
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/add-patient" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-content">
                  <AddPatient />
                </main>
              </>
            </ProtectedRoute>
          } />

          <Route path="/patients" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-content">
                  <PatientList />
                </main>
              </>
            </ProtectedRoute>
          } />

          <Route path="/patients/:id" element={
            <>
              <Navbar />
              <main className="main-content">
                <PatientDetails />
              </main>
            </>
          } />

          <Route path="/patients/:id/edit" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-content">
                  <EditPatient />
                </main>
              </>
            </ProtectedRoute>
          } />

          <Route path="/patients/:id/add-visit" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-content">
                  <AddVisit />
                </main>
              </>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
