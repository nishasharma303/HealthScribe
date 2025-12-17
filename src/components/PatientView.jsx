import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, AlertCircle, Activity } from 'lucide-react';
import { structureSOAP } from '../utils/soapStructure';
import BodyMap from './BodyMap';

const PatientView = ({ onSubmit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [error, setError] = useState('');
  const [browserSupport, setBrowserSupport] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [painLocations, setPainLocations] = useState([]);
  const [showVitals, setShowVitals] = useState(true);

  // Vitals state
  const [vitals, setVitals] = useState({
    height: '',
    weight: '',
    temperature: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    pulseRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    bmi: ''
  });

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const isRecordingRef = useRef(false); // Use ref to avoid closure issues
  const restartTimeoutRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupport(false);
      setError('Speech recognition not supported. Use Chrome or Edge browser.');
    } else {
      console.log('✅ Speech Recognition API available');
    }
  }, []);

  // Initialize Speech Recognition - ONLY recreate when language changes
  useEffect(() => {
    if (!browserSupport) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    console.log('🎤 Initializing recognition for language:', language);

    recognition.onstart = () => {
      console.log('✅ Recognition started');
      setError('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          console.log('📝 Final:', transcriptPart);
          finalTranscriptRef.current += transcriptPart + ' ';
          setTranscript(finalTranscriptRef.current);
        } else {
          interim += transcriptPart;
        }
      }
      
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      console.error('❌ Recognition error:', event.error);
      
      // Clear any pending restart
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      if (event.error === 'no-speech') {
        console.log('⚠️ No speech - continuing');
        return; // Don't show error, just continue
      } else if (event.error === 'aborted') {
        console.log('ℹ️ Recognition aborted (normal)');
        return;
      } else if (event.error === 'not-allowed') {
        setError('❌ Microphone blocked. Click the lock icon 🔒 in address bar and allow microphone.');
        setIsRecording(false);
        isRecordingRef.current = false;
      } else if (event.error === 'service-not-allowed') {
        setError('❌ Service not allowed. Ensure you are using HTTPS and Chrome/Edge.');
        setIsRecording(false);
        isRecordingRef.current = false;
      } else if (event.error === 'audio-capture') {
        setError('❌ No microphone detected.');
        setIsRecording(false);
        isRecordingRef.current = false;
      } else if (event.error === 'network') {
        setError('❌ Network error. Check internet connection.');
        setIsRecording(false);
        isRecordingRef.current = false;
      } else {
        console.error('Unhandled error:', event.error);
      }
    };

    recognition.onend = () => {
      console.log('🔄 Recognition ended, should restart?', isRecordingRef.current);
      
      // Clear any existing timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      // Use ref instead of state to avoid closure issues
      if (isRecordingRef.current) {
        console.log('⏰ Scheduling restart...');
        restartTimeoutRef.current = setTimeout(() => {
          if (isRecordingRef.current && recognitionRef.current) {
            try {
              console.log('♻️ Restarting...');
              recognitionRef.current.start();
            } catch (e) {
              console.error('Restart failed:', e);
              if (e.name !== 'InvalidStateError') {
                setIsRecording(false);
                isRecordingRef.current = false;
              }
            }
          }
        }, 500); // 500ms delay for stability
      }
    };

    recognitionRef.current = recognition;
    console.log('Recognition initialized');

    return () => {
      console.log('🧹 Cleaning up recognition');
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error('Cleanup error:', e);
        }
      }
    };
  }, [language, browserSupport]); // REMOVED isRecording from dependencies

  // Sync ref with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Auto-calculate BMI
  useEffect(() => {
    if (vitals.height && vitals.weight) {
      const heightInMeters = parseFloat(vitals.height) / 100;
      const weightInKg = parseFloat(vitals.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        setVitals(prev => ({ ...prev, bmi }));
      }
    }
  }, [vitals.height, vitals.weight]);

  const handleVitalChange = (field, value) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const startRecording = async () => {
    console.log('🎤 Start clicked');

    if (!browserSupport) {
      alert('Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }

    // Validate vitals
    const requiredVitals = ['temperature', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'pulseRate'];
    const missingVitals = requiredVitals.filter(field => !vitals[field]);
    
    if (missingVitals.length > 0) {
      const confirmStart = confirm(
        'Some vital signs are missing. Do you want to continue without them?\n\n' +
        'Missing: ' + missingVitals.join(', ')
      );
      if (!confirmStart) return;
    }

    // Reset
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimText('');
    setError('');
    setSubmitted(false);

    try {
      console.log('🎤 Requesting microphone...');
      
      // IMPORTANT: Abort any existing recognition first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (e) {
          console.log('No existing recognition to abort');
        }
      }

      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('✅ Microphone granted');

      // Start media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      console.log('📹 MediaRecorder started');

      // Set state AND ref
      setIsRecording(true);
      isRecordingRef.current = true;
      setShowVitals(false);

      // Small delay to ensure state is propagated
      await new Promise(resolve => setTimeout(resolve, 200));

      // Start recognition
      if (recognitionRef.current) {
        try {
          console.log('🗣️ Starting recognition...');
          recognitionRef.current.start();
        } catch (e) {
          console.error('Start error:', e);
          if (e.name === 'InvalidStateError') {
            console.log('Already started - OK');
          } else {
            throw e;
          }
        }
      }

    } catch (e) {
      console.error('❌ Failed to start:', e);
      
      if (e.name === 'NotAllowedError') {
        setError('❌ Microphone denied. Click 🔒 in address bar and allow microphone.');
      } else if (e.name === 'NotFoundError') {
        setError('❌ No microphone found.');
      } else if (e.name === 'NotReadableError') {
        setError('❌ Microphone in use by another app.');
      } else {
        setError(`❌ Failed: ${e.message}`);
      }
      
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    console.log('⏹️ Stop clicked');
    
    // Clear any pending restart
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    // Set state AND ref FIRST
    setIsRecording(false);
    isRecordingRef.current = false;
    
    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort(); // Use abort instead of stop for immediate effect
        console.log('✅ Recognition stopped');
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => {
            track.stop();
            console.log('✅ Track stopped:', track.kind);
          });
        }
      } catch (e) {
        console.error('Error stopping media:', e);
      }
    }

    setInterimText('');
    console.log('✅ Recording stopped');
  };

  const submitConsultation = async () => {
    if (!transcript.trim()) {
      alert('Please record something first!');
      return;
    }

    setError('Processing consultation with clinical intelligence...');

    try {
      const soap = await structureSOAP(transcript, painLocations, vitals);
      
      const consultation = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        transcript,
        detectedLanguage: soap.metadata.detectedLanguage,
        originalText: soap.metadata.originalText,
        translatedText: soap.metadata.translatedText,
        painLocations: painLocations,
        vitals: vitals,
        soapNote: soap,
        status: 'draft',
        approved: false,
        sentToPharmacy: false,
        sentToPatient: false
      };

      onSubmit(consultation);
      setSubmitted(true);
      setError('');
      
      if (soap.metadata.translatedText) {
        alert(`Hindi detected and translated!\n\nClinical Signals: ${soap.clinicalSignals.length} detected`);
      }
      
      setTimeout(() => {
        finalTranscriptRef.current = '';
        setTranscript('');
        setSubmitted(false);
        setPainLocations([]);
        setVitals({
          height: '',
          weight: '',
          temperature: '',
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          pulseRate: '',
          respiratoryRate: '',
          oxygenSaturation: '',
          bmi: ''
        });
        setShowVitals(true);
      }, 5000);
    } catch (error) {
      console.error('SOAP generation error:', error);
      setError('Failed to process consultation. Please try again.');
    }
  };

  return (
    <div className="patient-view-container">
      <div className="patient-header">
        <h1 className="patient-title">Patient Consultation</h1>
        <p className="patient-subtitle">Record symptoms and medical history</p>
      </div>

      <div className="disclaimer-banner">
        <AlertCircle size={20} />
        <div>
          <strong>Important:</strong> This system does NOT diagnose or recommend treatment. 
          It only organizes information for your doctor to review.
        </div>
      </div>

      {!browserSupport && (
        <div className="error-banner">
          <AlertCircle size={24} />
          <div>
            <p className="error-title">Speech recognition not available in this browser.</p>
            <p className="error-text">Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.</p>
          </div>
        </div>
      )}

      {/* Vitals Section */}
      {showVitals && (
        <div className="vitals-section">
          <div className="vitals-header">
            <Activity size={24} />
            <h3>Vital Signs</h3>
            <span className="vitals-badge">Required before recording</span>
          </div>

          <div className="vitals-grid">
            <div className="vital-input-group">
              <label>Height (cm)</label>
              <input
                type="number"
                value={vitals.height}
                onChange={(e) => handleVitalChange('height', e.target.value)}
                placeholder="170"
                min="0"
                max="250"
              />
            </div>

            <div className="vital-input-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                value={vitals.weight}
                onChange={(e) => handleVitalChange('weight', e.target.value)}
                placeholder="70"
                min="0"
                max="300"
              />
            </div>

            <div className="vital-input-group">
              <label>Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                value={vitals.temperature}
                onChange={(e) => handleVitalChange('temperature', e.target.value)}
                placeholder="98.6"
                min="90"
                max="110"
                className="required-vital"
              />
            </div>

            <div className="vital-input-group bp-group">
              <label>Blood Pressure (mmHg)</label>
              <div className="bp-inputs">
                <input
                  type="number"
                  value={vitals.bloodPressureSystolic}
                  onChange={(e) => handleVitalChange('bloodPressureSystolic', e.target.value)}
                  placeholder="120"
                  min="0"
                  max="300"
                  className="required-vital"
                />
                <span className="bp-separator">/</span>
                <input
                  type="number"
                  value={vitals.bloodPressureDiastolic}
                  onChange={(e) => handleVitalChange('bloodPressureDiastolic', e.target.value)}
                  placeholder="80"
                  min="0"
                  max="200"
                  className="required-vital"
                />
              </div>
            </div>

            <div className="vital-input-group">
              <label>Pulse Rate (bpm)</label>
              <input
                type="number"
                value={vitals.pulseRate}
                onChange={(e) => handleVitalChange('pulseRate', e.target.value)}
                placeholder="72"
                min="0"
                max="250"
                className="required-vital"
              />
            </div>

            <div className="vital-input-group">
              <label>Respiratory Rate (breaths/min)</label>
              <input
                type="number"
                value={vitals.respiratoryRate}
                onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
                placeholder="16"
                min="0"
                max="100"
              />
            </div>

            <div className="vital-input-group">
              <label>Oxygen Saturation (%)</label>
              <input
                type="number"
                value={vitals.oxygenSaturation}
                onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                placeholder="98"
                min="0"
                max="100"
              />
            </div>

            {vitals.bmi && (
              <div className="vital-input-group bmi-display">
                <label>BMI (Auto-calculated)</label>
                <div className="bmi-value">
                  {vitals.bmi}
                  <span className="bmi-category">
                    {vitals.bmi < 18.5 ? 'Underweight' :
                     vitals.bmi < 25 ? 'Normal' :
                     vitals.bmi < 30 ? 'Overweight' : 'Obese'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Language Selection */}
      <div className="language-section">
        <label className="language-label">Language / भाषा</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isRecording}
          className="language-select"
        >
          <option value="en-IN">English (India)</option>
          <option value="hi-IN">हिन्दी (Hindi)</option>
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
        </select>
      </div>

      {/* Recording Controls */}
      <div className="recording-controls">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            disabled={!browserSupport}
            className="btn-start-recording"
          >
            <Mic size={24} />
            Start Recording
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="btn-stop-recording"
          >
            <Square size={24} />
            Stop Recording
          </button>
        )}
      </div>

      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-pulse"></div>
          <span>RECORDING... Please speak clearly</span>
        </div>
      )}

      {error && !error.includes('Processing') && (
        <div className="error-message">
          {error}
        </div>
      )}

      {error && error.includes('Processing') && (
        <div className="processing-message">
          {error}
        </div>
      )}

      {/* Transcript Display */}
      <div className="transcript-section">
        <h3 className="transcript-title">Live Transcript</h3>
        <div className="transcript-box">
          {transcript && (
            <p className="transcript-final">{transcript}</p>
          )}
          {interimText && (
            <p className="transcript-interim">{interimText}</p>
          )}
          {!transcript && !interimText && !isRecording && (
            <p className="transcript-placeholder">
              Your words will appear here as you speak...
            </p>
          )}
          {!transcript && !interimText && isRecording && (
            <p className="transcript-listening">
              Listening... Please speak!
            </p>
          )}
        </div>

        {transcript && (
          <div className="transcript-stats">
            <span>Words: {transcript.split(' ').filter(w => w).length}</span>
            <span>Characters: {transcript.length}</span>
          </div>
        )}
      </div>

      {/* Body Map */}
      {transcript && !isRecording && (
        <BodyMap 
          selectedLocations={painLocations}
          onLocationSelect={setPainLocations}
        />
      )}

      {/* Submit Button */}
      {transcript && !isRecording && (
        <button 
          onClick={submitConsultation}
          className="btn-submit-consultation"
        >
          <Send size={20} />
          Submit for Doctor Review
        </button>
      )}

      {submitted && (
        <div className="success-message">
          <h3>Submitted Successfully</h3>
          <p>Your consultation has been structured and sent to the doctor for review.</p>
        </div>
      )}

      {/* Tips */}
      <div className="tips-section">
        <h4>Tips for Best Results:</h4>
        <ul>
          <li>Speak clearly at normal pace</li>
          <li>Mention timeline: "Since yesterday", "For 3 days"</li>
          <li>Describe symptoms: Location, duration, intensity</li>
          <li>Use Chrome or Edge browser for best compatibility</li>
          <li>Allow microphone permissions when prompted</li>
        </ul>
      </div>
    </div>
  );
};

export default PatientView;