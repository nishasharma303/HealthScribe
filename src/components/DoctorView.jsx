import React, { useState } from 'react';
import { CheckCircle, XCircle, Send, FileText, AlertTriangle, Activity, TrendingUp, Edit3, Save } from 'lucide-react';

const DoctorView = ({ consultations, updateConsultation }) => {
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [editedSoap, setEditedSoap] = useState(null);
  const [editingSections, setEditingSections] = useState({
    subjective: false,
    objective: false,
    assessment: false,
    plan: false
  });

  const viewConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setEditedSoap(JSON.parse(JSON.stringify(consultation.soapNote)));
    setEditingSections({
      subjective: false,
      objective: false,
      assessment: false,
      plan: false
    });
  };

  const toggleEditSection = (section) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateSubjectiveField = (field, value) => {
    setEditedSoap(prev => ({
      ...prev,
      subjective: {
        ...prev.subjective,
        [field]: value
      }
    }));
  };

  const updateObjectiveField = (field, value) => {
    setEditedSoap(prev => ({
      ...prev,
      objective: {
        ...prev.objective,
        [field]: value
      }
    }));
  };

  const updateAssessmentObservation = (index, value) => {
    const newObservations = [...editedSoap.assessment.observations];
    newObservations[index] = value;
    setEditedSoap(prev => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        observations: newObservations
      }
    }));
  };

  const addObservation = () => {
    setEditedSoap(prev => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        observations: [...prev.assessment.observations, '']
      }
    }));
  };

  const removeObservation = (index) => {
    setEditedSoap(prev => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        observations: prev.assessment.observations.filter((_, i) => i !== index)
      }
    }));
  };

  const updatePlanField = (field, value) => {
    setEditedSoap(prev => ({
      ...prev,
      plan: {
        ...prev.plan,
        [field]: value
      }
    }));
  };

  const saveChanges = () => {
    updateConsultation(selectedConsultation.id, {
      soapNote: editedSoap
    });
    setEditingSections({
      subjective: false,
      objective: false,
      assessment: false,
      plan: false
    });
    alert('Changes saved successfully');
  };

  const approveConsultation = () => {
    if (!selectedConsultation) return;

    const confirmation = confirm(
      'Are you sure you want to approve this consultation?\n\n' +
      'This will:\n' +
      '• Mark the consultation as approved\n' +
      '• Lock the SOAP note for finalization\n' +
      '• Enable sending to pharmacy and patient'
    );

    if (!confirmation) return;

    updateConsultation(selectedConsultation.id, {
      status: 'approved',
      approvedByDoctor: true,
      soapNote: editedSoap,
      approvedAt: new Date().toISOString()
    });

    alert('Consultation approved successfully');
    setSelectedConsultation(null);
  };

  const rejectConsultation = () => {
    if (!selectedConsultation) return;
    
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    updateConsultation(selectedConsultation.id, { 
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: new Date().toISOString()
    });
    
    alert('Consultation rejected');
    setSelectedConsultation(null);
  };

  const sendToPharmacy = () => {
    if (!selectedConsultation || !selectedConsultation.approvedByDoctor) return;
    
    const prescriptions = editedSoap.plan.prescriptions;
    if (!prescriptions || prescriptions === 'To be prescribed by doctor only') {
      alert('Please enter prescriptions before sending to pharmacy');
      return;
    }

    updateConsultation(selectedConsultation.id, { 
      sentToPharmacy: true,
      sentToPharmacyAt: new Date().toISOString()
    });
    
    alert('Plan and prescriptions sent to pharmacy successfully');
  };

  const sendToPatient = () => {
    if (!selectedConsultation || !selectedConsultation.approvedByDoctor) return;

    updateConsultation(selectedConsultation.id, { 
      sentToPatient: true,
      sentToPatientAt: new Date().toISOString()
    });
    
    alert('Complete SOAP note and education materials sent to patient');
  };

  const getRiskBadgeClass = (level) => {
    switch(level) {
      case 'CRITICAL': return 'risk-critical';
      case 'HIGH': return 'risk-high';
      case 'MEDIUM': return 'risk-medium';
      case 'LOW': return 'risk-low';
      default: return 'risk-low';
    }
  };

  if (!selectedConsultation) {
    return (
      <div className="doctor-dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Doctor Dashboard</h1>
            <p className="dashboard-subtitle">AI-powered clinical intelligence at your fingertips</p>
          </div>
        </div>

        <div className="consultations-container">
          <div className="consultations-header">
            <h2 className="consultations-title">
              <Activity size={24} />
              Consultations Queue
            </h2>
            <div className="consultations-count">
              {consultations.length} {consultations.length === 1 ? 'consultation' : 'consultations'}
            </div>
          </div>

          {consultations.length === 0 ? (
            <div className="empty-state-container">
              <div className="empty-state-icon">
                <FileText size={64} />
              </div>
              <h3 className="empty-state-title">No consultations yet</h3>
              <p className="empty-state-text">Waiting for patient submissions...</p>
            </div>
          ) : (
            <div className="consultations-list">
              {consultations.map(consultation => (
                <div key={consultation.id} className="consultation-card">
                  <div className="consultation-card-header">
                    <div className="consultation-info">
                      <span className="consultation-id">ID: {consultation.id}</span>
                      <span className={`status-badge-new status-${consultation.status}`}>
                        {consultation.status.toUpperCase()}
                      </span>
                      
                      {consultation.soapNote?.riskAssessment && (
                        <span className={`risk-badge ${getRiskBadgeClass(consultation.soapNote.riskAssessment.level)}`}>
                          Risk: {consultation.soapNote.riskAssessment.level}
                        </span>
                      )}

                      {consultation.soapNote?.clinicalSignals?.length > 0 && (
                        <span className="signals-badge">
                          {consultation.soapNote.clinicalSignals.length} Clinical Signals
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => viewConsultation(consultation)}
                      className="btn-review-new"
                    >
                      Review
                      <TrendingUp size={16} />
                    </button>
                  </div>

                  <div className="consultation-card-body">
                    <div className="consultation-meta">
                      <span className="meta-item">
                        <strong>Time:</strong> {new Date(consultation.createdAt).toLocaleString()}
                      </span>
                      {consultation.detectedLanguage === 'hi' && (
                        <span className="meta-badge">Translated from Hindi</span>
                      )}
                    </div>

                    {consultation.soapNote?.subjective?.chiefComplaint && (
                      <div className="chief-complaint-preview">
                        <strong>Chief Complaint:</strong> {consultation.soapNote.subjective.chiefComplaint}
                      </div>
                    )}

                    {consultation.soapNote?.riskAssessment && (
                      <div className="urgency-indicator">
                        <AlertTriangle size={16} />
                        {consultation.soapNote.riskAssessment.urgency}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const riskAssessment = editedSoap.riskAssessment;

  return (
    <div className="doctor-review-container">
      <button onClick={() => setSelectedConsultation(null)} className="back-btn">
        ← Back to Dashboard
      </button>

      {/* Risk Stratification Panel */}
      {riskAssessment && (
        <div className={`risk-panel ${getRiskBadgeClass(riskAssessment.level)}`}>
          <div className="risk-header">
            <div className="risk-icon">
              <Activity size={32} />
            </div>
            <div className="risk-content">
              <h3 className="risk-title">Risk Stratification</h3>
              <div className="risk-details">
                <div className="risk-level">
                  Level: <strong>{riskAssessment.level}</strong>
                </div>
                <div className="risk-score">
                  Score: <strong>{riskAssessment.score}/10</strong>
                </div>
                <div className="risk-urgency">
                  {riskAssessment.urgency}
                </div>
              </div>
            </div>
          </div>
          {riskAssessment.factors.length > 0 && (
            <div className="risk-factors">
              <strong>Contributing Factors:</strong>
              <ul>
                {riskAssessment.factors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Clinical Signals */}
      {editedSoap.clinicalSignals && editedSoap.clinicalSignals.length > 0 && (
        <div className="signals-panel">
          <h3 className="panel-section-title">
            <Activity size={20} />
            Clinical Signals Detected
          </h3>
          <div className="signals-grid-layout">
            {editedSoap.clinicalSignals.map((signal, idx) => (
              <div key={idx} className={`signal-card-new signal-${signal.type.toLowerCase()}`}>
                <div className="signal-header-new">
                  <span className={`signal-badge signal-badge-${signal.type.toLowerCase()}`}>
                    {signal.type}
                  </span>
                </div>
                <h4 className="signal-title-new">{signal.signal}</h4>
                <p className="signal-evidence-new">
                  <strong>Evidence:</strong> {signal.evidence}
                </p>
                <p className="signal-implication-new">
                  <strong>Implication:</strong> {signal.clinicalImplication}
                </p>
                <p className="signal-recommendation-new">
                  <strong>Recommendation:</strong> {signal.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consistency Issues */}
      {editedSoap.consistencyIssues && editedSoap.consistencyIssues.length > 0 && (
        <div className="consistency-panel-new">
          <h3 className="panel-section-title">
            <AlertTriangle size={20} />
            Consistency Check
          </h3>
          {editedSoap.consistencyIssues.map((issue, idx) => (
            <div key={idx} className={`consistency-issue-new severity-${issue.severity.toLowerCase()}`}>
              <div className="issue-header-new">
                <span className="issue-type">{issue.type}</span>
                <span className={`severity-badge severity-${issue.severity.toLowerCase()}`}>
                  {issue.severity}
                </span>
              </div>
              <p className="issue-detail"><strong>Issue:</strong> {issue.issue}</p>
              <p className="issue-context"><strong>Context:</strong> {issue.context}</p>
              <p className="issue-suggestion"><strong>Suggestion:</strong> {issue.suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {/* Emotion Analysis */}
      {editedSoap.emotionAnalysis && editedSoap.emotionAnalysis.stressLevel !== 'normal' && (
        <div className="emotion-panel-new">
          <h3 className="panel-section-title">Patient Emotional State</h3>
          <div className={`emotion-content stress-${editedSoap.emotionAnalysis.stressLevel}`}>
            <div className="emotion-header">
              <strong>Stress Level:</strong> {editedSoap.emotionAnalysis.stressLevel.toUpperCase()}
            </div>
            {editedSoap.emotionAnalysis.indicators.length > 0 && (
              <div className="emotion-indicators">
                <strong>Indicators:</strong>
                <ul>
                  {editedSoap.emotionAnalysis.indicators.map((ind, idx) => (
                    <li key={idx}>{ind}</li>
                  ))}
                </ul>
              </div>
            )}
            {editedSoap.emotionAnalysis.recommendation && (
              <p className="emotion-recommendation">
                <AlertTriangle size={16} />
                {editedSoap.emotionAnalysis.recommendation}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="review-grid">
        {/* Left: Transcript */}
        <div className="transcript-panel-new">
          <h3 className="panel-title-new">Original Transcript</h3>
          
          {selectedConsultation.detectedLanguage === 'hi' && (
            <div className="translation-banner">
              <div className="translation-header">
                <strong>Auto-translated from Hindi</strong>
              </div>
              <div className="translation-content">
                <div className="translation-original">
                  <label>Original (Hindi):</label>
                  <p>{selectedConsultation.originalText}</p>
                </div>
                <div className="translation-english">
                  <label>Translated (English):</label>
                  <p>{selectedConsultation.translatedText}</p>
                </div>
              </div>
            </div>
          )}

          <div className="transcript-text">
            {selectedConsultation.transcript}
          </div>

          {selectedConsultation.painLocations && selectedConsultation.painLocations.length > 0 && (
            <div className="pain-locations-display">
              <strong>Marked Pain Locations:</strong>
              <div className="pain-pills">
                {selectedConsultation.painLocations.map((loc) => (
                  <span key={loc.id} className="pain-pill">
                    {loc.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: SOAP Note with Full Editing */}
        <div className="soap-panel-new">
          <div className="soap-header-new">
            <h3 className="panel-title-new">SOAP Note</h3>
            <button onClick={saveChanges} className="btn-save-changes">
              <Save size={16} />
              Save All Changes
            </button>
          </div>

          <div className="soap-sections">
            {/* SUBJECTIVE */}
            <div className="soap-section-new soap-subjective-new">
              <div className="section-header-new">
                <h4 className="section-title-new">S - SUBJECTIVE</h4>
                <button 
                  onClick={() => toggleEditSection('subjective')}
                  className="btn-edit-section"
                >
                  <Edit3 size={14} />
                  {editingSections.subjective ? 'Done' : 'Edit'}
                </button>
              </div>

              <div className="section-content-new">
                {/* Chief Complaint */}
                <div className="field-group">
                  <label className="field-label">Chief Complaint</label>
                  {editingSections.subjective ? (
                    <input
                      type="text"
                      value={editedSoap.subjective.chiefComplaint}
                      onChange={(e) => updateSubjectiveField('chiefComplaint', e.target.value)}
                      className="field-input"
                    />
                  ) : (
                    <p className="field-value">{editedSoap.subjective.chiefComplaint}</p>
                  )}
                </div>

                {/* Quick Facts Grid */}
                {editedSoap.subjective.symptoms && (
                  <div className="quick-facts-grid">
                    <div className="fact-item">
                      <label>Onset</label>
                      {editingSections.subjective ? (
                        <input
                          type="text"
                          value={editedSoap.subjective.onset}
                          onChange={(e) => updateSubjectiveField('onset', e.target.value)}
                          className="field-input-small"
                        />
                      ) : (
                        <p>{editedSoap.subjective.onset}</p>
                      )}
                    </div>
                    <div className="fact-item">
                      <label>Duration</label>
                      {editingSections.subjective ? (
                        <input
                          type="text"
                          value={editedSoap.subjective.duration}
                          onChange={(e) => updateSubjectiveField('duration', e.target.value)}
                          className="field-input-small"
                        />
                      ) : (
                        <p>{editedSoap.subjective.duration}</p>
                      )}
                    </div>
                    <div className="fact-item">
                      <label>Severity</label>
                      {editingSections.subjective ? (
                        <select
                          value={editedSoap.subjective.severity}
                          onChange={(e) => updateSubjectiveField('severity', e.target.value)}
                          className="field-select"
                        >
                          <option>Not specified</option>
                          <option>Mild</option>
                          <option>Moderate</option>
                          <option>Severe</option>
                        </select>
                      ) : (
                        <p>{editedSoap.subjective.severity}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Symptoms */}
                {editedSoap.subjective.symptoms && editedSoap.subjective.symptoms.length > 0 && (
                  <div className="field-group">
                    <label className="field-label">Presenting Symptoms</label>
                    <ul className="symptoms-list">
                      {editedSoap.subjective.symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timeline */}
                {editedSoap.subjective.timeline && editedSoap.subjective.timeline.length > 0 && (
                  <div className="field-group">
                    <label className="field-label">Timeline</label>
                    <ul className="timeline-list-new">
                      {editedSoap.subjective.timeline.map((item, idx) => (
                        <li key={idx}>{item.event}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* History Summary */}
                {editedSoap.subjective.historyOfPresentIllness && (
                  <div className="field-group">
                    <label className="field-label">History Summary</label>
                    {editingSections.subjective ? (
                      <textarea
                        value={editedSoap.subjective.historyOfPresentIllness}
                        onChange={(e) => updateSubjectiveField('historyOfPresentIllness', e.target.value)}
                        className="field-textarea"
                        rows={3}
                      />
                    ) : (
                      <p className="field-value">{editedSoap.subjective.historyOfPresentIllness}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* OBJECTIVE */}
            <div className="soap-section-new soap-objective-new">
              <div className="section-header-new">
                <h4 className="section-title-new">O - OBJECTIVE</h4>
                <button 
                  onClick={() => toggleEditSection('objective')}
                  className="btn-edit-section"
                >
                  <Edit3 size={14} />
                  {editingSections.objective ? 'Done' : 'Edit'}
                </button>
              </div>

              <div className="section-content-new">
                {/* Display vitals from patient input */}
                {selectedConsultation.vitals && Object.values(selectedConsultation.vitals).some(v => v) && (
                  <div className="vitals-display-section">
                    <label className="field-label">Recorded Vitals</label>
                    <div className="vitals-display-grid">
                      {selectedConsultation.vitals.temperature && (
                        <div className="vital-display-item">
                          <span className="vital-label">Temperature:</span>
                          <span className="vital-value">{selectedConsultation.vitals.temperature}°F</span>
                        </div>
                      )}
                      {selectedConsultation.vitals.bloodPressureSystolic && selectedConsultation.vitals.bloodPressureDiastolic && (
                        <div className="vital-display-item">
                          <span className="vital-label">Blood Pressure:</span>
                          <span className="vital-value">
                            {selectedConsultation.vitals.bloodPressureSystolic}/
                            {selectedConsultation.vitals.bloodPressureDiastolic} mmHg
                          </span>
                        </div>
                      )}
                      {selectedConsultation.vitals.pulseRate && (
                        <div className="vital-display-item">
                          <span className="vital-label">Pulse:</span>
                          <span className="vital-value">{selectedConsultation.vitals.pulseRate} bpm</span>
                        </div>
                      )}
                      {selectedConsultation.vitals.respiratoryRate && (
                        <div className="vital-display-item">
                          <span className="vital-label">Respiratory Rate:</span>
                          <span className="vital-value">{selectedConsultation.vitals.respiratoryRate} /min</span>
                        </div>
                      )}
                      {selectedConsultation.vitals.oxygenSaturation && (
                        <div className="vital-display-item">
                          <span className="vital-label">SpO2:</span>
                          <span className="vital-value">{selectedConsultation.vitals.oxygenSaturation}%</span>
                        </div>
                      )}
                      {selectedConsultation.vitals.height && selectedConsultation.vitals.weight && (
                        <>
                          <div className="vital-display-item">
                            <span className="vital-label">Height:</span>
                            <span className="vital-value">{selectedConsultation.vitals.height} cm</span>
                          </div>
                          <div className="vital-display-item">
                            <span className="vital-label">Weight:</span>
                            <span className="vital-value">{selectedConsultation.vitals.weight} kg</span>
                          </div>
                        </>
                      )}
                      {selectedConsultation.vitals.bmi && (
                        <div className="vital-display-item vital-bmi">
                          <span className="vital-label">BMI:</span>
                          <span className="vital-value">{selectedConsultation.vitals.bmi}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="field-group">
                  <label className="field-label">Physical Examination</label>
                  {editingSections.objective ? (
                    <textarea
                      value={editedSoap.objective.examination}
                      onChange={(e) => updateObjectiveField('examination', e.target.value)}
                      className="field-textarea"
                      rows={4}
                      placeholder="General: Alert and oriented, no acute distress&#10;HEENT: Normal&#10;Cardiovascular: S1 S2 normal, no murmurs&#10;Respiratory: Clear to auscultation bilaterally"
                    />
                  ) : (
                    <p className="field-value">{editedSoap.objective.examination}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ASSESSMENT */}
            <div className="soap-section-new soap-assessment-new">
              <div className="section-header-new">
                <h4 className="section-title-new">A - ASSESSMENT</h4>
                <button 
                  onClick={() => toggleEditSection('assessment')}
                  className="btn-edit-section"
                >
                  <Edit3 size={14} />
                  {editingSections.assessment ? 'Done' : 'Edit'}
                </button>
              </div>

              <div className="section-content-new">
                <div className="field-group">
                  <label className="field-label">Clinical Observations</label>
                  {editingSections.assessment ? (
                    <div className="observations-editor">
                      {editedSoap.assessment.observations.map((obs, idx) => (
                        <div key={idx} className="observation-item">
                          <input
                            type="text"
                            value={obs}
                            onChange={(e) => updateAssessmentObservation(idx, e.target.value)}
                            className="field-input"
                            placeholder="Enter observation..."
                          />
                          <button
                            onClick={() => removeObservation(idx)}
                            className="btn-remove-observation"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button onClick={addObservation} className="btn-add-observation">
                        + Add Observation
                      </button>
                    </div>
                  ) : (
                    <ul className="observations-list">
                      {editedSoap.assessment.observations.map((obs, idx) => (
                        <li key={idx}>{obs}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* PLAN */}
            <div className="soap-section-new soap-plan-new">
              <div className="section-header-new">
                <h4 className="section-title-new">P - PLAN</h4>
                <button 
                  onClick={() => toggleEditSection('plan')}
                  className="btn-edit-section"
                >
                  <Edit3 size={14} />
                  {editingSections.plan ? 'Done' : 'Edit'}
                </button>
              </div>

              <div className="section-content-new">
                <div className="field-group">
                  <label className="field-label">Recommendations</label>
                  {editingSections.plan ? (
                    <textarea
                      value={editedSoap.plan.recommendations}
                      onChange={(e) => updatePlanField('recommendations', e.target.value)}
                      className="field-textarea"
                      rows={4}
                      placeholder="Rest, hydration, symptomatic treatment..."
                    />
                  ) : (
                    <p className="field-value">{editedSoap.plan.recommendations}</p>
                  )}
                </div>

                <div className="field-group">
                  <label className="field-label">Prescriptions</label>
                  {editingSections.plan ? (
                    <textarea
                      value={editedSoap.plan.prescriptions}
                      onChange={(e) => updatePlanField('prescriptions', e.target.value)}
                      className="field-textarea prescription-area"
                      rows={6}
                      placeholder="Tab. Paracetamol 500mg - 1 tab TDS x 3 days&#10;Syp. Cough - 2 tsp TDS x 5 days"
                    />
                  ) : (
                    <p className="field-value prescription-value">{editedSoap.plan.prescriptions}</p>
                  )}
                  <small className="field-hint">Only licensed doctors can prescribe medications</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Education Preview */}
      {editedSoap.patientEducation && editedSoap.patientEducation.condition && (
        <div className="education-panel-new">
          <h3 className="panel-section-title">Patient Education Material</h3>
          <div className="education-grid">
            <div className="education-card">
              <h4>Condition</h4>
              <p>{editedSoap.patientEducation.condition}</p>
            </div>

            {editedSoap.patientEducation.explanation && (
              <div className="education-card">
                <h4>Explanation</h4>
                <p>{editedSoap.patientEducation.explanation}</p>
              </div>
            )}

            {editedSoap.patientEducation.whatToDo && editedSoap.patientEducation.whatToDo.length > 0 && (
              <div className="education-card">
                <h4>What To Do</h4>
                <ul>
                  {editedSoap.patientEducation.whatToDo.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {editedSoap.patientEducation.whatToAvoid && editedSoap.patientEducation.whatToAvoid.length > 0 && (
              <div className="education-card">
                <h4>What To Avoid</h4>
                <ul>
                  {editedSoap.patientEducation.whatToAvoid.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {editedSoap.patientEducation.whenToReturn && editedSoap.patientEducation.whenToReturn.length > 0 && (
              <div className="education-card">
                <h4>When To Return</h4>
                <ul>
                  {editedSoap.patientEducation.whenToReturn.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions Panel */}
      <div className="actions-panel-new">
        <h3 className="panel-section-title">Actions</h3>
        <div className="actions-grid">
          <button
            onClick={rejectConsultation}
            className="action-btn-new btn-reject-new"
          >
            <XCircle size={20} />
            Reject Consultation
          </button>
          
          <button
            onClick={approveConsultation}
            disabled={selectedConsultation.approvedByDoctor}
            className="action-btn-new btn-approve-new"
          >
            <CheckCircle size={20} />
            {selectedConsultation.approvedByDoctor ? 'Already Approved' : 'Approve Consultation'}
          </button>

          {selectedConsultation.approvedByDoctor && (
            <>
              <button
                onClick={sendToPharmacy}
                disabled={selectedConsultation.sentToPharmacy}
                className="action-btn-new btn-pharmacy-new"
              >
                <Send size={20} />
                {selectedConsultation.sentToPharmacy ? 'Sent to Pharmacy' : 'Send to Pharmacy'}
              </button>

              <button
                onClick={sendToPatient}
                disabled={selectedConsultation.sentToPatient}
                className="action-btn-new btn-patient-new"
              >
                <FileText size={20} />
                {selectedConsultation.sentToPatient ? 'Sent to Patient' : 'Send to Patient'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorView; 