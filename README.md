# HealthScribe

HealthScribe is an AI-powered **clinical documentation assistant** that helps doctors convert real-time doctor–patient conversations into **structured, editable SOAP notes**.

It is designed to reduce documentation time, improve note consistency, and allow doctors to focus more on patient care — while keeping **full human control** over all medical decisions.

HealthScribe assists documentation only. It does **not** diagnose, prescribe, or make autonomous medical decisions.

---

## What HealthScribe Does

- Captures doctor–patient conversations using real-time voice recognition  
- Converts natural speech into structured **SOAP clinical notes**
- Automatically highlights important **clinical signals** such as:
  - Worsening symptoms
  - Sleep disturbance
  - Functional impairment
  - Delayed care
  - Emotional distress indicators
- Flags contradictory patient statements for clarification
- Supports **multi-language input** (Hindi/English with auto-translation)
- Allows doctors to fully **review, edit, approve, or reject** generated notes
- Sends approved summaries to patients or pharmacies only after doctor approval

All outputs remain under the doctor’s control.

---

## Why HealthScribe

Doctors spend a significant portion of their day on documentation rather than patient care. Manual note-taking is time-consuming, inconsistent, and prone to missing important details.

HealthScribe reduces documentation time from minutes to seconds while improving clarity, consistency, and clinical awareness — without replacing clinical judgment.

---

## Technologies Used

**Frontend**
- React 18
- Vite
- JavaScript (ES6+)
- CSS3
- Lucide React (icons)

**Browser APIs**
- Web Speech API (SpeechRecognition)
- MediaRecorder API

**AI / NLP (Rule-Based)**
- Speech-to-text transcription
- Language detection and translation
- Symptom and timeline extraction
- Clinical signal detection
- Heuristic risk prioritization
- Consistency checking

---

## Data & Privacy (Demo Version)

- All data is stored locally in the browser
- No backend or server-side storage
- Speech recognition and translation are handled by browser/Google services (demo use)
- No data is sent automatically without doctor approval

This project is a **prototype/demo** and is not intended for production clinical use.

---

## Disclaimer

HealthScribe is a clinical documentation assistant only.  
It does **not** provide medical advice, diagnosis, or prescriptions.  
All medical decisions must be made by licensed healthcare professionals.
