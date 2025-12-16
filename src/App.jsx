import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PatientView from './components/PatientView';
import DoctorView from './components/DoctorView';
import LandingPage from './components/LandingPage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [consultations, setConsultations] = useState([]);

  const handleConsultationSubmit = (consultation) => {
    setConsultations(prev => [consultation, ...prev]);
  };

  const updateConsultation = (id, updates) => {
    setConsultations(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleEnterApp = (view) => {
    setCurrentView(view);
  };

  if (currentView === 'landing') {
    return <LandingPage onEnter={handleEnterApp} />;
  }

  return (
    <div className="app">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="main-content">
        {currentView === 'patient' ? (
          <PatientView onSubmit={handleConsultationSubmit} />
        ) : (
          <DoctorView 
            consultations={consultations} 
            updateConsultation={updateConsultation}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;