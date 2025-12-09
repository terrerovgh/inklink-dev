# InkLink 🖋️

> **The AI-Native Marketplace for the Modern Tattoo Industry.**  
> *Connect, Design, and Get Inked in the 505.*

![Version](https://img.shields.io/badge/version-0.1.0-blueviolet)
![Status](https://img.shields.io/badge/status-MVP-emerald)
![Tech](https://img.shields.io/badge/tech-React%20%7C%20Tailwind%20%7C%20Gemini%20AI-white)

## 📖 Overview

InkLink is a next-generation platform designed to "Uber-ize" the tattoo industry. It solves the friction between impulsive/custom tattoo demand and artist availability. 

By leveraging **Google Gemini AI** for design generation and **Geolocation** for real-time availability, InkLink connects clients with the perfect artist in Albuquerque (and beyond).

## ✨ Key Features

### For Clients
- **🧬 Tattoo Studio Wizard**: A 5-step AI powered flow.
  - **Concept**: Describe your idea.
  - **3D Placement**: Select zones on an interactive holographic body model.
  - **AI Stencil**: Generate production-ready line art stencils instantly.
  - **Virtual Try-On**: Upload a photo and see the tattoo on your skin.
  - **Spec Report**: Get an auto-generated budget and time estimate.
- **📍 Real-Time Map**: Find studios with "Walk-In Available" status near you.
- **💎 Reverse Auction Market**: Post your project and let artists bid on it.

### For Artists
- **🎨 Studio Command Center**: A complete CRM dashboard.
- **⚡ Smart Chat**: AI-powered replies ("Professional" vs "Friendly") and project context integration.
- **📢 Promo Generator**: Turn flash sheets into branded Instagram Stories in 1 click.
- **📂 Portfolio Management**: Upload work and manage your digital storefront.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite.
- **Styling**: Tailwind CSS (Zinc/Dark Mode Aesthetic).
- **Animations**: Framer Motion.
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`, `gemini-2.5-flash-image`).
- **3D Engine**: Three.js (Procedural Geometry).
- **Maps**: Leaflet + CartoDB Dark Matter Tiles.
- **Icons**: Lucide React.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Cloud API Key with Gemini API access.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/inklink.git
   cd inklink
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🗺️ Navigation

| View | Description |
|------|-------------|
| **Feed** | Infinite scroll of local tattoo work (Guest Mode restricted). |
| **Map** | Geospatial discovery of studios. |
| **Studio** | The AI creation wizard (Triggered from Home). |
| **Market** | Browse open client projects or post your own. |
| **Dashboard** | User profile, settings, and artist tools. |

## 📄 License

Proprietary - InkLink Inc.
