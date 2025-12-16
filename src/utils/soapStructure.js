import { 
  extractClinicalSignals, 
  checkConsistency, 
  generatePatientEducation, 
  analyzeEmotion,
  calculateRiskScore
} from './clinicalSignals';

// Language Detection
const detectLanguage = (text) => {
  const hindiPattern = /[\u0900-\u097F]/;
  if (hindiPattern.test(text)) return 'hi';
  return 'en';
};

// Free Translation using Google Translate
const translateToEnglish = async (text) => {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    const translated = data[0].map(item => item[0]).join('');
    return translated;
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Return original if translation fails
  }
};

// Extract concise symptoms (not full sentences)
const extractSymptoms = (text) => {
  const symptoms = [];
  
  const symptomPatterns = {
    'Headache': /headache|head\s*pain|sir\s*dard/i,
    'Fever': /fever|temperature|bukhar/i,
    'Cough': /cough|coughing|khansi/i,
    'Cold': /cold|runny nose|sardi|nazla/i,
    'Sore throat': /sore throat|throat pain|gale.*dard/i,
    'Body ache': /body\s*ache|body\s*pain|badan\s*dard/i,
    'Nausea': /nausea|vomit|ulti/i,
    'Dizziness': /dizzy|dizziness|chakkar/i,
    'Weakness': /weak|weakness|kamzori|thakan/i,
    'Stomach pain': /stomach\s*pain|abdomen|pet.*dard/i,
    'Chest pain': /chest\s*pain/i,
    'Breathing difficulty': /breathing|breath|saans/i,
  };

  for (let [symptom, pattern] of Object.entries(symptomPatterns)) {
    if (pattern.test(text)) {
      symptoms.push(symptom);
    }
  }

  return [...new Set(symptoms)]; // Remove duplicates
};

// Extract timeline (concise)
const extractTimeline = (text) => {
  const timelineEvents = [];
  
  const timePatterns = [
    { regex: /(\d+)\s*days?\s*ago/i, format: (m) => `Started ${m[1]} days ago` },
    { regex: /(\d+)\s*weeks?\s*ago/i, format: (m) => `Started ${m[1]} weeks ago` },
    { regex: /(\d+)\s*months?\s*ago/i, format: (m) => `Started ${m[1]} months ago` },
    { regex: /since\s*yesterday/i, format: () => 'Started yesterday' },
    { regex: /since\s*morning/i, format: () => 'Started this morning' },
    { regex: /since\s*evening/i, format: () => 'Started this evening' },
    { regex: /for\s*(\d+)\s*days?/i, format: (m) => `Duration: ${m[1]} days` },
    { regex: /for\s*(\d+)\s*hours?/i, format: (m) => `Duration: ${m[1]} hours` },
    { regex: /today/i, format: () => 'Started today' },
  ];

  timePatterns.forEach(({ regex, format }) => {
    const match = text.match(regex);
    if (match) {
      timelineEvents.push({
        time: new Date().toISOString(),
        event: format(match)
      });
    }
  });

  return timelineEvents;
};

// Extract severity
const extractSeverity = (text) => {
  if (/severe|very|terrible|unbearable|excruciating|bahut.*zyada/i.test(text)) return 'Severe';
  if (/moderate|medium/i.test(text)) return 'Moderate';
  if (/mild|slight|light|minor|halka/i.test(text)) return 'Mild';
  return 'Not specified';
};

// Extract duration
const extractDuration = (text) => {
  const durationMatch = text.match(/for\s*(\d+)\s*(day|days|week|weeks|month|months|hour|hours)/i);
  if (durationMatch) {
    return `${durationMatch[1]} ${durationMatch[2]}`;
  }
  return 'Not specified';
};

// Extract onset
const extractOnset = (text) => {
  if (/yesterday|kal/i.test(text)) return 'Yesterday';
  if (/today|aaj/i.test(text)) return 'Today';
  if (/(\d+)\s*days?\s*ago/i.test(text)) {
    const match = text.match(/(\d+)\s*days?\s*ago/i);
    return `${match[1]} days ago`;
  }
  if (/(\d+)\s*weeks?\s*ago/i.test(text)) {
    const match = text.match(/(\d+)\s*weeks?\s*ago/i);
    return `${match[1]} weeks ago`;
  }
  return 'Not specified';
};

// Generate clarifying questions
const generateQuestions = (symptoms, text) => {
  const questions = [];
  
  if (symptoms.includes('Fever')) {
    questions.push('Have you measured your temperature?');
    questions.push('Any chills, sweating, or rigors?');
  }
  
  if (symptoms.includes('Headache')) {
    questions.push('Rate pain severity 1-10?');
    questions.push('Location: frontal/temporal/occipital?');
    questions.push('Any visual disturbances or nausea?');
  }
  
  if (symptoms.includes('Cough')) {
    questions.push('Dry or productive (with phlegm)?');
    questions.push('Any blood in sputum?');
  }
  
  if (symptoms.includes('Stomach pain')) {
    questions.push('Exact location in abdomen?');
    questions.push('Relation to meals?');
    questions.push('Any vomiting or diarrhea?');
  }
  
  if (symptoms.includes('Chest pain')) {
    questions.push('⚠️ URGENT: Radiation to arm/jaw?');
    questions.push('⚠️ Any shortness of breath?');
    questions.push('⚠️ Immediate ECG needed');
  }

  if (!text.includes('medicine') && !text.includes('tablet') && !text.includes('dawa')) {
    questions.push('Any medications already taken?');
  }

  if (!text.includes('allergy')) {
    questions.push('Known drug allergies?');
  }

  return questions.length > 0 ? questions : ['Complete medical history needed'];
};

// Generate observations
const generateObservations = (symptoms, severity, clinicalSignals) => {
  const observations = [];
  
  if (symptoms.length === 0) {
    observations.push('Patient presents with non-specific complaints');
    return observations;
  }

  if (symptoms.includes('Fever') && symptoms.includes('Cough')) {
    observations.push('Clinical picture consistent with upper respiratory tract infection');
  }
  
  if (symptoms.includes('Fever') && symptoms.includes('Body ache')) {
    observations.push('Viral syndrome under consideration');
  }
  
  if (symptoms.includes('Chest pain')) {
    observations.push('URGENT: Chest pain requires immediate cardiac evaluation');
  }
  
  if (symptoms.includes('Breathing difficulty')) {
    observations.push('URGENT: Respiratory distress - priority assessment required');
  }
  
  if (severity === 'Severe') {
    observations.push('Severe symptoms reported - prioritize assessment');
  }

  if (clinicalSignals && clinicalSignals.some(s => s.type === 'CRITICAL')) {
    observations.push('Critical clinical signals detected - see AI analysis above');
  }

  observations.push('Differential diagnosis pending physician review and examination');
  
  return observations;
};

// Helper function to format vitals
const formatVitals = (vitals) => {
  const parts = [];
  
  if (vitals.temperature) {
    parts.push(`Temp: ${vitals.temperature}°F`);
  }
  
  if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
    parts.push(`BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`);
  }
  
  if (vitals.pulseRate) {
    parts.push(`HR: ${vitals.pulseRate} bpm`);
  }
  
  if (vitals.respiratoryRate) {
    parts.push(`RR: ${vitals.respiratoryRate} /min`);
  }
  
  if (vitals.oxygenSaturation) {
    parts.push(`SpO2: ${vitals.oxygenSaturation}%`);
  }
  
  if (vitals.height && vitals.weight) {
    parts.push(`Ht: ${vitals.height}cm, Wt: ${vitals.weight}kg`);
  }
  
  if (vitals.bmi) {
    parts.push(`BMI: ${vitals.bmi}`);
  }
  
  return parts.length > 0 ? parts.join(' | ') : 'To be filled by vitals desk';
};

// Main SOAP Structure Function
export const structureSOAP = async (transcript, painLocations = [], vitals = {}) => {
  let workingText = transcript;
  let translatedText = null;
  let detectedLanguage = 'en';
  
  // Detect language
  detectedLanguage = detectLanguage(transcript);
  
  // Translate if Hindi
  if (detectedLanguage === 'hi') {
    console.log('🌐 Hindi detected, translating...');
    translatedText = await translateToEnglish(transcript);
    workingText = translatedText;
    console.log('✅ Translation complete');
  }

  const text = workingText.toLowerCase();
  
  // Extract information
  const symptoms = extractSymptoms(text);
  const timeline = extractTimeline(text);
  const severity = extractSeverity(text);
  const onset = extractOnset(text);
  const duration = extractDuration(text);

  // Build concise chief complaint
  let chiefComplaint = '';
  if (symptoms.length > 0) {
    chiefComplaint = symptoms.slice(0, 3).join(', ');
  } else {
    chiefComplaint = 'Patient reports discomfort';
  }

  // Build history (first sentence only, or summary)
  const sentences = workingText.split(/[.!?]+/).filter(s => s.trim());
  const historyOfPresentIllness = sentences[0] ? sentences[0].trim() : '';

  // Format vitals for display
  const formattedVitals = formatVitals(vitals);

  const soap = {
    // Metadata for translation info
    metadata: {
      detectedLanguage,
      originalText: detectedLanguage === 'hi' ? transcript : null,
      translatedText: translatedText,
    },

    subjective: {
      chiefComplaint: chiefComplaint,
      historyOfPresentIllness: historyOfPresentIllness,
      
      // Added concise fields
      symptoms: symptoms,
      onset: onset,
      duration: duration,
      severity: severity,
      painLocations: painLocations,
      
      timeline: timeline
    },
    
    objective: {
      vitals: formattedVitals, // Now uses actual vitals
      examination: 'To be documented by doctor'
    },
    
    assessment: {
      observations: [],
      clarifyingQuestions: generateQuestions(symptoms, text)
    },
    
    plan: {
      recommendations: 'To be determined by doctor',
      prescriptions: 'To be prescribed by doctor only'
    }
  };

  // Add AI features
  soap.clinicalSignals = extractClinicalSignals(transcript, soap);
  soap.consistencyIssues = checkConsistency(transcript, soap);
  soap.patientEducation = generatePatientEducation(soap, detectedLanguage);
  soap.emotionAnalysis = analyzeEmotion(transcript);
  soap.riskAssessment = calculateRiskScore(soap, soap.clinicalSignals);
  
  // Update observations with all info
  soap.assessment.observations = generateObservations(symptoms, severity, soap.clinicalSignals);

  return soap;
};