# 🏗️ Technical Architecture

## 📂 File Structure

```text
/
├── index.html              # Entry point, import maps, global styles
├── index.tsx               # React DOM root
├── App.tsx                 # Main Application Logic & Routing
├── types.ts                # TypeScript Interfaces (Data Models)
├── schema.sql              # Supabase Database Definition
├── components/             # UI Components
│   ├── BodySelector.tsx    # Three.js 3D Model
│   ├── Dashboard.tsx       # Complex User/Artist Dashboard
│   ├── GuestFeed.tsx       # Public Feed with Auth Wall
│   ├── MapExplorer.tsx     # Leaflet Map Implementation
│   ├── MarketplaceDetail.tsx # Project View & Bidding
│   ├── PromoGenerator.tsx  # Canvas-based Image Generator
│   ├── TattooStudio.tsx    # AI Creation Wizard (The Core Feature)
│   └── ... (SpotlightCard, Navigation, etc.)
├── context/
│   └── AuthContext.tsx     # Global User State & Mock Auth
├── services/
│   └── geminiService.ts    # AI Logic (Text generation, Image generation, Chat prediction)
└── data/
    └── mockData.ts         # Static data for MVP demonstration
```

## 🛣️ Routing Logic

InkLink is currently a **Single Page Application (SPA)** that uses "Virtual Routing" managed by state in `App.tsx`.

### State Variable: `view`
The `view` string determines which major component is rendered in the `<main>` area.

| Route Key | Component Rendered | Triggered By |
|-----------|--------------------|--------------|
| `'home'` | `<GuestFeed />` | Default load, Logo click |
| `'market'` | `<Marketplace />` | Nav Bar 'Market' |
| `'market-detail'` | `<MarketplaceDetail />` | Clicking a card in Market |
| `'dashboard'` | `<Dashboard />` | Nav Bar 'Studio' / Profile Icon |
| `'profile'` | `<ArtistProfile />` | Clicking an artist in Map or Feed |
| `'canvas'` | *Direct Action* | Nav Bar 'Create' (Triggers Studio Overlay) |

### Overlay Routing
The **Tattoo Studio Wizard** is handled as a global overlay (`showStudio` boolean) rather than a route, allowing it to be triggered from anywhere without losing background context.

## 💾 Data Flow & State Management

1.  **Global Auth**: Handled by `AuthContext`.
    - Persists to `localStorage` key `inklink_user`.
    - Manages `UserRole` (Client vs Artist).

2.  **Local Persistence**:
    - **Tattoo Wizard**: Saves draft progress to `inklink_studio_draft`.
    - **Artist Profile**: Edits save to `inklink_artist_{id}`.
    - **Feed Data**: Master tattoo list saves to `inklink_tattoos`.

3.  **AI Integration**:
    - Frontend calls `geminiService.ts`.
    - Service calls Google GenAI API.
    - Results (Images/JSON) are injected back into React State.

## 🔒 Security Notes (MVP)

- **API Keys**: Currently stored in `.env` and exposed to client (Standard for pure client-side demos). Production would require a Proxy Server/Edge Function.
- **Auth**: Simulation only. Production requires integration with Supabase Auth or Firebase Auth.
