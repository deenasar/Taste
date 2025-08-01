# Taste - AI-Powered Personality Archetype App

A React Native app that analyzes your cultural preferences to determine your unique taste personality archetype.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd taste
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env.local`
   - Fill in your actual API keys and configuration values

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Firestore Database
   - Add your Firebase config to `.env.local`

5. **Gemini API Setup**
   - Get a Gemini API key from Google AI Studio
   - Add it to `.env.local`

6. **Run the app**
   ```bash
   npm run dev
   ```

## Features

- AI-powered personality archetype analysis
- Cultural preference quiz
- Personalized recommendations
- Social features and community
- Dark/light mode support

## Tech Stack

- React Native
- Firebase Firestore
- Google Gemini AI
- AsyncStorage for local data