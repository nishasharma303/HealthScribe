import React, { useEffect, useState } from 'react';
import { ArrowRight, Mic, Brain, Zap, Shield, Clock, Users, TrendingUp, Star, CheckCircle2 } from 'lucide-react';

const LandingPage = ({ onEnter }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="landing-page-new">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-orb orb-1" style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
        }}></div>
        <div className="gradient-orb orb-2" style={{
          transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
        }}></div>
        <div className="gradient-orb orb-3" style={{
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
        }}></div>
        <div className="gradient-mesh"></div>
      </div>

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      <div className="landing-content">
        {/* Hero Section */}
        <section className="hero-section-new">
          <div className="hero-badge-new">
            <Zap size={16} className="badge-icon" />
            <span>Powered by Advanced AI</span>
            <div className="badge-pulse"></div>
          </div>

          <h1 className="hero-title-new">
            Your AI Clinical
            <span className="gradient-text-new"> Documentation Assistant</span>
          </h1>

          <p className="hero-description">
            Transform patient consultations into comprehensive clinical notes in seconds. 
            HealthScribe listens, structures, and extracts critical insights—so you can focus on patient care.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10x</div>
              <div className="stat-label">Faster Documentation</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Hours Saved/Month</div>
            </div>
          </div>

          <div className="hero-cta">
            <button className="btn-primary-new" onClick={() => onEnter('patient')}>
              <Mic size={20} />
              <span>Start Recording Consultation</span>
              <ArrowRight size={20} className="btn-arrow" />
            </button>
            <button className="btn-secondary-new" onClick={() => onEnter('doctor')}>
              <Brain size={20} />
              <span>View Dashboard</span>
            </button>
          </div>

          <div className="hero-trust">
            <div className="trust-avatars">
              <div className="avatar"></div>
              <div className="avatar"></div>
              <div className="avatar"></div>
              <div className="avatar avatar-count">+500</div>
            </div>
            <div className="trust-text">
              <div className="trust-rating">
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
              </div>
              <p>Trusted by 500+ healthcare professionals</p>
            </div>
          </div>
        </section>

        {/* Demo Preview */}
        <section className="demo-preview" style={{
          transform: `translateY(${scrollY * 0.1}px)`
        }}>
          <div className="demo-window">
            <div className="demo-header">
              <div className="demo-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="demo-title">Live Consultation Recording</div>
            </div>
            <div className="demo-content">
              <div className="demo-waveform">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="wave-bar" style={{
                    animationDelay: `${i * 0.05}s`
                  }}></div>
                ))}
              </div>
              <div className="demo-text">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="demo-transcript">
                  "Patient reports severe headache for 3 days, worsening at night, 
                  affecting sleep. Pain scale 8/10..."
                </p>
              </div>
              <div className="demo-ai-badge">
                <Brain size={16} />
                <span>AI Processing</span>
                <div className="processing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="features-section-new">
          <div className="section-header-landing">
            <h2 className="section-title-landing">Why Doctors Choose HealthScribe</h2>
            <p className="section-subtitle-landing">
              Built by doctors, for doctors—powered by cutting-edge AI
            </p>
          </div>

          <div className="features-grid-new">
            <div className="feature-card-new feature-highlight">
              <div className="feature-glow"></div>
              <div className="feature-icon-new purple">
                <Brain size={32} />
              </div>
              <h3>Clinical Signal Detection</h3>
              <p>
                AI automatically identifies progressive worsening, sleep disruption, 
                functional impairment, and critical red flags—surfaced before you diagnose.
              </p>
              <ul className="feature-list">
                <li><CheckCircle2 size={16} /> Progressive symptom tracking</li>
                <li><CheckCircle2 size={16} /> Risk stratification engine</li>
                <li><CheckCircle2 size={16} /> Urgency flagging system</li>
              </ul>
            </div>

            <div className="feature-card-new">
              <div className="feature-icon-new blue">
                <Zap size={28} />
              </div>
              <h3>Real-Time SOAP Generation</h3>
              <p>
                Instant structured notes while you consult. Subjective, Objective, 
                Assessment, and Plan—ready for your review and approval.
              </p>
            </div>

            <div className="feature-card-new">
              <div className="feature-icon-new green">
                <Shield size={28} />
              </div>
              <h3>Doctor-in-the-Loop</h3>
              <p>
                AI assists, never decides. Full control over edits, approvals, 
                and prescriptions. Complete HIPAA compliance built-in.
              </p>
            </div>

            <div className="feature-card-new">
              <div className="feature-icon-new orange">
                <TrendingUp size={28} />
              </div>
              <h3>Smart Consistency Checks</h3>
              <p>
                Detects contradictions in patient statements, flags missing vitals, 
                and suggests follow-up questions you might have missed.
              </p>
            </div>

            <div className="feature-card-new">
              <div className="feature-icon-new pink">
                <Clock size={28} />
              </div>
              <h3>Timeline Visualization</h3>
              <p>
                Symptom progression mapped over time. See patterns, duration, 
                and worsening trends at a glance.
              </p>
            </div>

            <div className="feature-card-new">
              <div className="feature-icon-new teal">
                <Users size={28} />
              </div>
              <h3>Multi-Language Support</h3>
              <p>
                Patients speak in Hindi, English, or regional languages. 
                AI translates and structures in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="workflow-section-new">
          <h2 className="section-title-landing">How It Works</h2>
          <p className="section-subtitle-landing">Four simple steps to better documentation</p>

          <div className="workflow-timeline">
            <div className="timeline-line"></div>
            
            <div className="workflow-step-new">
              <div className="step-icon">
                <Mic size={24} />
              </div>
              <div className="step-content-new">
                <div className="step-number-new">01</div>
                <h3>Record Consultation</h3>
                <p>
                  Click start and conduct your consultation naturally. 
                  Voice-to-text captures every word with medical terminology recognition.
                </p>
              </div>
            </div>

            <div className="workflow-step-new workflow-step-right">
              <div className="step-icon">
                <Brain size={24} />
              </div>
              <div className="step-content-new">
                <div className="step-number-new">02</div>
                <h3>AI Structures SOAP</h3>
                <p>
                  Advanced NLP extracts symptoms, timeline, severity, and generates 
                  structured SOAP notes with clinical signals highlighted.
                </p>
              </div>
            </div>

            <div className="workflow-step-new">
              <div className="step-icon">
                <CheckCircle2 size={24} />
              </div>
              <div className="step-content-new">
                <div className="step-number-new">03</div>
                <h3>Review & Edit</h3>
                <p>
                  Full editing control. Modify any section, add observations, 
                  enter prescriptions. AI suggestions guide, you decide.
                </p>
              </div>
            </div>

            <div className="workflow-step-new workflow-step-right">
              <div className="step-icon">
                <TrendingUp size={24} />
              </div>
              <div className="step-content-new">
                <div className="step-number-new">04</div>
                <h3>Approve & Send</h3>
                <p>
                  One-click approval sends prescriptions to pharmacy and 
                  patient education materials via email. Complete documentation saved.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={32} />
              </div>
              <div className="stat-value">5 min</div>
              <div className="stat-description">Average documentation time (vs 20 min manual)</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Brain size={32} />
              </div>
              <div className="stat-value">15+</div>
              <div className="stat-description">Clinical signals detected per consultation</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <div className="stat-value">500+</div>
              <div className="stat-description">Doctors already saving time daily</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Shield size={32} />
              </div>
              <div className="stat-value">100%</div>
              <div className="stat-description">HIPAA compliant, secure, and private</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-card">
            <div className="cta-glow"></div>
            <h2>Ready to Transform Your Practice?</h2>
            <p>Join hundreds of doctors who've reclaimed their time and improved documentation quality.</p>
            <div className="cta-buttons">
              <button className="btn-primary-new" onClick={() => onEnter('patient')}>
                <Mic size={20} />
                <span>Start Your First Consultation</span>
                <ArrowRight size={20} className="btn-arrow" />
              </button>
              <button className="btn-outline-new" onClick={() => onEnter('doctor')}>
                View Live Demo
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>HealthScribe</h3>
              <p>AI-powered clinical documentation for modern healthcare</p>
            </div>
            <div className="footer-disclaimer">
              <Shield size={20} />
              <div>
                <h4>Medical Disclaimer</h4>
                <p>
                  HealthScribe is a clinical documentation assistant. It does not diagnose, 
                  treat, or prescribe. All medical decisions must be made by licensed healthcare 
                  professionals.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;