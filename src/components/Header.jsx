import React from 'react';
import { FileText } from 'lucide-react';

const Header = ({ currentView, setCurrentView }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">HealthScribe</h1>
              <p className="text-sm text-gray-600">Medical Documentation Assistant</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('patient')}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${
                currentView === 'patient'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Patient View
            </button>
            <button
              onClick={() => setCurrentView('doctor')}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${
                currentView === 'doctor'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Doctor Dashboard
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;