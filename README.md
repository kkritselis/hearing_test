# earMeNow - Software Design Document (SDD)

## Project Overview

### Name
**earMeNow** - Web-Based Hearing Test Application

### Purpose
The purpose of this project is to provide users with a simple, browser-based tool to assess their hearing range. The application plays tones at specific frequencies and allows users to respond to the sounds they can hear, generating a basic hearing profile report. It is not a substitute for a medical audiogram but can serve as an informative self-check.

### Target Audience
- Adults concerned about hearing loss
- Musicians or sound professionals
- General users interested in monitoring hearing health

### Platform
- HTML5 web application
- Compatible with modern browsers on desktop and mobile

### Core Features
- Pure-tone generation using Web Audio API
- Frequency and volume-based hearing threshold test
- Simple user interface with clear instructions
- Visual report (audiogram-style chart)
- Optional result export/download
- No user data collection by default

### Design Philosophy
- Clean, minimal, and professional
- Mobile-friendly layout
- Focus on accessibility and ease-of-use

---

## Task Checklist

### 🎯 Project Planning
- [x] Define frequency ranges (250 Hz to 8000 Hz)
- [x] Determine decibel level simulation (via gain adjustments)
- [ ] Research best practices in digital hearing screening

### 🎨 UI/UX Design
- [x] Design wireframes for all screens:
  - [x] Welcome/Instruction Screen
  - [x] Hearing Test Interface
  - [ ] Results Page (Audiogram)
  - [x] Calibration Screen (optional)
- [x] Ensure mobile responsiveness
- [x] Choose accessible color scheme and fonts

### 🧠 Core Functionality
- [x] Set up tone generator using Web Audio API
- [x] Implement test flow:
  - [x] Present tones by frequency
  - [x] Record if user hears tone
  - [x] Store threshold per frequency
- [x] Implement control for user responses (e.g., "I hear it" button)
- [x] Add instructions and progress indicators

### 📊 Data & Reporting
- [x] Store test results in JavaScript object
- [x] Display audiogram using Chart.js or Canvas
- [x] Interpret results with basic categories (Normal, Mild, Moderate, Severe Loss)
- [x] Add option to download report (PDF or JSON)

### 🧪 Testing
- [ ] Test across major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Perform accuracy tests with known frequencies
- [ ] Accessibility testing (screen readers, keyboard nav)
- [ ] Performance and responsiveness testing

### 🚀 Deployment
- [x] Set up hosting (e.g., GitHub Pages, Netlify)
- [ ] Create a branded landing page
- [ ] Include disclaimers and contact info

### 📣 Post-Launch
- [ ] User feedback collection
- [ ] Add advanced options (left/right ear, noise masking)
- [ ] Optional: Language localization

---

Let me know when you're ready to expand a section or start writing code.
