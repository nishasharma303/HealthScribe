// Clinical Signal Extraction Engine

export const extractClinicalSignals = (transcript, soapNote) => {
  const text = transcript.toLowerCase();
  const signals = [];

  // Progressive Worsening
  const worseningPatterns = [
    /getting worse/i, /keeps coming back/i, /more severe/i, 
    /increasing/i, /worsening/i, /spreading/i
  ];
  
  if (worseningPatterns.some(pattern => pattern.test(text))) {
    signals.push({
      type: 'CRITICAL',
      signal: 'Progressive symptom worsening',
      evidence: 'Patient reports symptoms are getting worse over time',
      clinicalImplication: 'May indicate advancing disease process - prioritize assessment',
      recommendation: 'Consider escalation of care'
    });
  }

  // Sleep Disruption
  const sleepPatterns = [
    /wakes me up/i, /can't sleep/i, /disturbs.*sleep/i, 
    /at night/i, /keeps me awake/i
  ];
  
  if (sleepPatterns.some(pattern => pattern.test(text))) {
    signals.push({
      type: 'HIGH',
      signal: 'Sleep disruption due to symptoms',
      evidence: 'Symptoms severe enough to interfere with sleep',
      clinicalImplication: 'Indicates significant symptom burden',
      recommendation: 'Assess need for symptom management'
    });
  }

  // Delayed Care Seeking
  const delayPatterns = [
    /thought it was nothing/i, /waited.*days/i, /didn't think/i,
    /ignored/i, /finally decided/i
  ];
  
  if (delayPatterns.some(pattern => pattern.test(text))) {
    signals.push({
      type: 'MEDIUM',
      signal: 'Delay in seeking medical care',
      evidence: 'Patient initially minimized or ignored symptoms',
      clinicalImplication: 'Condition may be more advanced than timeline suggests',
      recommendation: 'Thorough examination warranted'
    });
  }

  // Recurrent Symptoms
  const recurrentPatterns = [
    /keeps coming back/i, /again and again/i, /multiple times/i,
    /recurring/i, /keeps happening/i
  ];
  
  if (recurrentPatterns.some(pattern => pattern.test(text))) {
    signals.push({
      type: 'HIGH',
      signal: 'Recurrent symptoms',
      evidence: 'Pattern of symptom recurrence noted',
      clinicalImplication: 'Consider chronic or relapsing condition',
      recommendation: 'Investigate underlying cause'
    });
  }

  // Functional Impairment
  const activityPatterns = [
    /can't work/i, /unable to/i, /difficult to/i,
    /stopped.*activities/i, /had to stop/i
  ];
  
  if (activityPatterns.some(pattern => pattern.test(text))) {
    signals.push({
      type: 'CRITICAL',
      signal: 'Functional impairment',
      evidence: 'Symptoms interfering with daily activities',
      clinicalImplication: 'Significant quality of life impact',
      recommendation: 'Aggressive symptom management needed'
    });
  }

  // Emotional Distress
  const emotionalPatterns = [
    /worried/i, /scared/i, /anxious/i, /concerned/i, /afraid/i
  ];
  
  if (emotionalPatterns.some(pattern => pattern.test(text))) {
    signals.push({
      type: 'MEDIUM',
      signal: 'Emotional distress present',
      evidence: 'Patient expressing worry or anxiety',
      clinicalImplication: 'Consider psychological support',
      recommendation: 'Address patient concerns and provide reassurance'
    });
  }

  // Red Flag Symptoms
  if (text.includes('chest pain') || text.includes('chest pressure')) {
    signals.push({
      type: 'CRITICAL',
      signal: 'URGENT: Chest pain reported',
      evidence: 'Patient reports chest pain or pressure',
      clinicalImplication: 'Rule out acute coronary syndrome',
      recommendation: 'IMMEDIATE cardiac evaluation required'
    });
  }

  if (text.includes('shortness of breath') || text.includes('difficulty breathing')) {
    signals.push({
      type: 'CRITICAL',
      signal: 'URGENT: Respiratory distress',
      evidence: 'Patient reports breathing difficulty',
      clinicalImplication: 'Potential respiratory emergency',
      recommendation: 'IMMEDIATE respiratory assessment required'
    });
  }

  return signals;
};

// Consistency Checker
export const checkConsistency = (transcript, soapNote) => {
  const issues = [];
  const text = transcript.toLowerCase();

  // Fever contradiction
  const hasFeverMention = /fever|temperature|hot|chills/i.test(text);
  const hasNoFeverMention = /no fever|no temperature|afebrile/i.test(text);
  
  if (hasFeverMention && hasNoFeverMention) {
    issues.push({
      severity: 'HIGH',
      type: 'Contradiction',
      issue: 'Conflicting fever information',
      context: 'Patient both mentioned having fever and denied fever',
      suggestion: 'Clarify current fever status and obtain temperature measurement'
    });
  }

  // Pain contradiction
  const hasPainMention = /pain|hurt|ache/i.test(text);
  const hasNoPainMention = /no pain|pain free|doesn't hurt/i.test(text);
  
  if (hasPainMention && hasNoPainMention) {
    issues.push({
      severity: 'MEDIUM',
      type: 'Contradiction',
      issue: 'Conflicting pain information',
      context: 'Contradictory statements about pain presence',
      suggestion: 'Verify exact location and nature of pain'
    });
  }

  // Medication contradiction
  const takesMeds = /taking.*medicine|on medication|prescribed/i.test(text);
  const noMeds = /no medicine|not taking|no medication/i.test(text);
  
  if (takesMeds && noMeds) {
    issues.push({
      severity: 'HIGH',
      type: 'Medication Conflict',
      issue: 'Unclear medication history',
      context: 'Conflicting information about current medications',
      suggestion: 'Obtain complete and accurate medication list'
    });
  }

  // Timeline inconsistency
  const hasRecent = /today|yesterday|this morning/i.test(text);
  const hasOld = /weeks ago|months ago|long time/i.test(text);
  
  if (hasRecent && hasOld) {
    issues.push({
      severity: 'MEDIUM',
      type: 'Timeline Inconsistency',
      issue: 'Unclear symptom timeline',
      context: 'Multiple different time references provided',
      suggestion: 'Establish clear chronological sequence of events'
    });
  }

  return issues;
};

// Generate observations (FIXED TERMINOLOGY)
const generateObservations = (symptoms, severity, clinicalSignals) => {
  const observations = [];
  
  if (symptoms.length === 0) {
    observations.push('Patient presents with non-specific complaints');
    return observations;
  }

  // CHANGED: "Clinical picture" instead of "diagnosis"
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

  if (clinicalSignals.some(s => s.type === 'CRITICAL')) {
    observations.push('Critical clinical patterns detected - see analysis above');
  }

  // CHANGED: "Clinical considerations" instead of "differential diagnosis"
  observations.push('Clinical considerations pending physician review and examination');
  
  return observations;
};

// Risk Stratification (HONEST CLAIMS)
export const calculateRiskScore = (soapNote, clinicalSignals) => {
  let riskScore = 0;
  let riskFactors = [];

  // Severity assessment
  if (soapNote.subjective.severity === 'Severe') {
    riskScore += 3;
    riskFactors.push('Severe symptom severity reported');
  } else if (soapNote.subjective.severity === 'Moderate') {
    riskScore += 2;
    riskFactors.push('Moderate symptom severity');
  }

  // Critical symptoms
  const criticalSymptoms = ['Chest pain', 'Breathing difficulty', 'Severe headache'];
  const hasCritical = soapNote.subjective.symptoms?.some(s => 
    criticalSymptoms.some(cs => s.includes(cs))
  );
  
  if (hasCritical) {
    riskScore += 5;
    riskFactors.push('Critical symptoms present');
  }

  // Clinical signals
  const criticalSignals = clinicalSignals.filter(s => s.type === 'CRITICAL').length;
  riskScore += criticalSignals * 2;
  if (criticalSignals > 0) {
    riskFactors.push(`${criticalSignals} critical clinical patterns detected`);
  }

  // Progressive worsening
  if (clinicalSignals.some(s => s.signal.includes('worsening'))) {
    riskScore += 2;
    riskFactors.push('Progressive worsening noted');
  }

  // Functional impairment
  if (clinicalSignals.some(s => s.signal.includes('Functional impairment'))) {
    riskScore += 2;
    riskFactors.push('Impact on daily function');
  }

  // Determine risk level
  let riskLevel = 'LOW';
  let urgency = 'Routine';
  
  if (riskScore >= 8) {
    riskLevel = 'CRITICAL';
    urgency = 'IMMEDIATE attention recommended';
  } else if (riskScore >= 5) {
    riskLevel = 'HIGH';
    urgency = 'Priority assessment recommended';
  } else if (riskScore >= 3) {
    riskLevel = 'MEDIUM';
    urgency = 'Standard care pathway';
  } else {
    riskLevel = 'LOW';
    urgency = 'Routine consultation';
  }

  return {
    score: riskScore,
    level: riskLevel,
    urgency: urgency,
    factors: riskFactors,
    disclaimer: 'Heuristic-based prioritization - not clinically validated. Prototype estimates based on rule coverage.'
  };
};

// Patient Education Generator
export const generatePatientEducation = (soapNote, language = 'en') => {
  const symptoms = soapNote.subjective.symptoms || [];
  
  let education = {
    condition: '',
    explanation: '',
    whatToDo: [],
    whatToAvoid: [],
    whenToReturn: [],
    language: language
  };

  // Fever + Cough = URTI
  if (symptoms.includes('Fever') && symptoms.includes('Cough')) {
    education.condition = language === 'hi' 
      ? 'संभावित श्वसन संक्रमण'
      : 'Likely Upper Respiratory Tract Infection';
    
    education.explanation = language === 'hi'
      ? 'यह वायरस या बैक्टीरिया के कारण होता है और आमतौर पर 5-7 दिनों में ठीक हो जाता है।'
      : 'This is commonly caused by viruses or bacteria and typically resolves in 5-7 days with proper care.';
    
    education.whatToDo = language === 'hi' ? [
      'डॉक्टर द्वारा निर्धारित दवाएं नियमित रूप से लें',
      'खूब पानी और तरल पदार्थ पिएं',
      'पर्याप्त आराम करें',
      'गर्म तरल पदार्थ (सूप, चाय) लें'
    ] : [
      'Take prescribed medications regularly',
      'Drink plenty of fluids (8-10 glasses daily)',
      'Get adequate rest and sleep',
      'Consume warm liquids (soup, tea)'
    ];
    
    education.whatToAvoid = language === 'hi' ? [
      'ठंडे पेय और आइसक्रीम से बचें',
      'धूम्रपान न करें',
      'भारी व्यायाम से बचें'
    ] : [
      'Avoid cold drinks and ice cream',
      'No smoking',
      'Avoid strenuous exercise'
    ];
    
    education.whenToReturn = language === 'hi' ? [
      'बुखार 3 दिन से अधिक रहे',
      'सांस लेने में कठिनाई हो',
      'लक्षणों में सुधार न हो'
    ] : [
      'Fever persists beyond 3 days',
      'Breathing difficulty develops',
      'No improvement with medication'
    ];
  }

  return education;
};

// Emotion/Sentiment Analysis (FIXED CLAIMS)
export const analyzeEmotion = (transcript) => {
  const text = transcript.toLowerCase();
  
  const analysis = {
    stressLevel: 'normal',
    indicators: [],
    recommendation: '',
    distressScore: 0,
    disclaimer: 'Heuristic-based flagging only - not psychological assessment'
  };

  // Stress words
  const stressWords = ['worried', 'scared', 'can\'t', 'terrible', 'unbearable', 'afraid', 'anxious'];
  const stressCount = stressWords.filter(word => text.includes(word)).length;
  analysis.distressScore += stressCount * 2;

  // Severity words
  if (/severe|unbearable|worst|excruciating/i.test(text)) {
    analysis.indicators.push('High-severity language detected');
    analysis.distressScore += 3;
  }

  // Desperation
  if (/please help|desperate|can't take it/i.test(text)) {
    analysis.indicators.push('Potential distress indicators');
    analysis.distressScore += 4;
  }

  // Pain progression
  if (/getting worse|can't bear|killing me/i.test(text)) {
    analysis.indicators.push('Progressive symptom worsening language');
    analysis.distressScore += 2;
  }

  // Determine level - CHANGED WORDING
  if (analysis.distressScore >= 7) {
    analysis.stressLevel = 'critical';
    analysis.recommendation = 'Patient shows potential signs of severe distress - consider prioritization';
  } else if (analysis.distressScore >= 4) {
    analysis.stressLevel = 'high';
    analysis.recommendation = 'Potential significant patient distress - consider prioritization';
  } else if (analysis.distressScore >= 2) {
    analysis.stressLevel = 'moderate';
    analysis.recommendation = 'Monitor patient emotional state';
  }

  return analysis;
};