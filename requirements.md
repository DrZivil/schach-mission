# Game Requirements: Mission Schach

## Ziel
Offline-fähiges, kinderfreundliches Schachlernspiel mit strukturierter Missionslogik, lokalem Fortschrittsspeicher und PWA-Integration. Architektur so vorbereitet, dass eine spätere Umstellung auf SQLite oder MySQL problemlos möglich ist.

## Technologien (Basisversion)
- HTML5 + CSS3 + Vanilla JavaScript
- [Chess.js](https://github.com/jhlywa/chess.js)
- Eigene UI (Canvas oder DOM)
- localStorage zur Fortschrittsspeicherung
- PWA mit `manifest.json` + `service-worker.js`

## Erweiterungsfähigkeit: Datenbank-Anbindung (optional)

### Design-Prinzipien
- Missionsdaten & Fortschritt sind objektbasiert getrennt
- Klare Schnittstelle `saveProgress()`, `loadProgress()` mit Speicher-Adapter
- Fortschritt kann wahlweise in:
  - `localStorage` (default)
  - SQLite (z. B. mit Tauri)
  - MySQL (z. B. via REST API / PHP / Node)
  gespeichert werden

### Speicher-Adapter-Pattern (Beispielstruktur)
```js
// progress.js
export const StorageAdapter = {
  save: (missionId, data) => {
    localStorage.setItem(missionId, JSON.stringify(data));
  },
  load: (missionId) => {
    const raw = localStorage.getItem(missionId);
    return raw ? JSON.parse(raw) : null;
  }
  // optional: override this with server/SQL logic
};
```

## Hauptmodule

### 1. Missions-Auswahl
- Übersicht aller Missionen mit Fortschritt
- Struktur: `mission_list.json`
- JSON kann leicht aus DB gespeist oder in HTML generiert werden

### 2. Missionssystem
- Missionsdateien: 1 JSON pro Mission
- Struktur vorbereitet für Datenbank-Schema:
```sql
missions (
  id TEXT PRIMARY KEY,
  title TEXT,
  level TEXT,
  type TEXT,
  instruction TEXT,
  board_initial TEXT,
  board_solution TEXT,
  goals TEXT[],
  solution TEXT[],
  scoring JSON
)
```

### 3. Spiellogik
- Chess.js prüft gültige Züge, Spielzustände
- UI bietet Drag & Drop oder Click Move
- Feedback über definierte solution-Züge oder Match-Logik

### 4. Fortschritt (lokal, aber DB-ready)
- Fortschritt aktuell in localStorage
- Erweiterbar auf:
  - SQLite (Tauri, Electron, Cordova)
  - MySQL/MariaDB (`fetch('/api/progress?user=x&mission=01')`)
```sql
progress (
  user_id TEXT,
  mission_id TEXT,
  status TEXT, -- 'locked', 'in_progress', 'done'
  score INT,
  last_played TIMESTAMP
)
```

### 5. Offline-Fähigkeit (PWA)
- `manifest.json` für Homescreen-Integration (iPad)
- `service-worker.js` cached alle Assets & Missionen
- App funktioniert komplett offline

## UX/UI
- Responsive für Tablet/Desktop
- Neutraler, freundlicher Comic-Stil
- Fokus auf einfache Bedienung, hohe Lesbarkeit
- Fortschrittsanzeige pro Mission (z. B. Sterne)

## Dateien & Struktur
```
📁 mission-schach/
├── index.html
├── manifest.json
├── service-worker.js
├── /css/
├── /js/
│   ├── main.js
│   ├── progress.js        # Speicheradapter
│   ├── chess.min.js
│   └── missions/
│       ├── mission_01.json
│       └── ...
├── /img/
├── /data/
│   └── mission_list.json
```

## Erweiterbarkeit
- Neue Missionen über JSON oder DB-Einträge
- Backend kann später leicht nachgerüstet werden
- Speicherlogik modular via Adapter

## Bonusideen
- Benutzerverwaltung (später via DB/API)
- Online-Multiplayer oder Turniermodus
- Exportfunktion für Fortschritt

---

**Captain, diese Architektur ist startbereit für lokal & klein, aber offen für groß & vernetzt.**

Mögliche nächste Schritte:
- StorageAdapter für SQLite vorbereiten
- SQL-Schema-Export für Missionen & Fortschritt
- Backend-Prototyp mit PHP/MySQL
- Grundlegende Projektstruktur aufbauen
