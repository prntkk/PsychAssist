# PsychAssist: Local AI Psychological Frameworks

PsychAssist is a **100% private, fully localized AI psychology assistant** built with **Next.js** and **Ollama**. It guides users through therapeutic frameworks such as **CBT (Cognitive Behavioral Therapy)** and **ACT (Acceptance and Commitment Therapy)** while ensuring that **no data ever leaves the device**.

---

## Features

### Absolute Privacy
Runs strictly **locally using Llama 3**, ensuring that all user interactions remain on the device.

### Framework Personas
Users can switch between different therapeutic or philosophical guidance modes, such as:

- CBT (Cognitive Behavioral Therapy)  
- Stoicism  
- Mindfulness  
- ACT (Acceptance and Commitment Therapy)

Each persona shapes responses based on its specific framework.

### Safety Gate
Intercepts crisis-related keywords and redirects users to **emergency resources** when necessary.

### Sentiment UI
The interface dynamically changes **background glow and visual mood** based on the sentiment detected in user input.

### Neural Link
Includes **voice-to-text** and **text-to-speech** capabilities for natural conversational interaction.

---

## Tech Stack

### Frontend
- Next.js 16  
- Tailwind CSS  
- React Context  

### Backend
- Local Ollama runtime  
- Llama 3 model  
- Next.js API Routes  

---

## Getting Started

### 1. Start the Local AI Model
ollama run llama3

### 2. Install Dependencies
npm install

### 3. Run the Development Server
npm run dev

### 4. Open the Application
http://localhost:3000

---

## Disclaimer

This project is intended **for educational purposes only**.  
It is **not a substitute for professional medical advice, diagnosis, or therapy**.  
If you are experiencing mental health difficulties, please seek help from a qualified professional.