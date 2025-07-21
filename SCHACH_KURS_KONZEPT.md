# User Story: Vater-Tochter-Schachkurs

## Zielgruppe
- Vater (Erwachsener mit Grundkenntnissen)
- Tochter (Kind, kompletter Anfänger)

## Kursidee
Der Kurs vermittelt spielerisch die Grundlagen des Schachs und führt später in einfach verständliche Strategien ein. Beide lernen gemeinsam, wobei Missionsfortschritte getrennt gespeichert werden können. 

## Struktur des Kurses
- **Tracks** gruppieren Missionen thematisch.
- Zwei Haupttracks werden bereitgestellt:
  1. **Einsteiger** – kindgerechte Einführung in Regeln und Grundzüge.
  2. **Strategie 101** – einfache Strategiekonzepte für den Erwachsenen.
- Jede Mission erklärt ein konkretes Ziel (z.B. "Ziehe den Bauern"), zeigt ein Startbrett und überprüft den Zug.

## Beispiel-Track "Einsteiger"
1. Das Schachbrett kennenlernen
2. Bauern ziehen
3. Türme bewegen
4. Läufer bewegen
5. Springer-Sprung

## Beispiel-Track "Strategie 101"
1. Zentrumskontrolle
2. Figurenentwicklung
3. Kurze Rochade
4. Doppeldrohung
5. Fesselung anwenden

## Interaktive Game-UI
- Drag-und-Drop-Schachbrett mit einfachen Animationen.
- Fortschrittsanzeige in Sternen pro Mission.
- Tipp-Funktion und gesprochene Anweisungen für Kinder.
- Missionsauswahlbildschirm mit Karten für jeden Track.
- Möglichkeit, über einen **Import**-Button neue Tracks/Missionen als JSON hochzuladen.

## Implementierungsplan (Auszug)
1. Missions- und Trackdaten als JSON-Struktur definieren (`js/missions`).
2. In `mission-manager.js` Importfunktionen bereitstellen, um neue Daten zu laden.
3. In `main.js` Datei-Upload verarbeiten und Missionen anzeigen.
4. UI-Elemente in `index.html` ergänzen (Import-Button).
5. Später: Fortschrittsverwaltung je Benutzer, evtl. Exportfunktion.

Mit diesem Konzept kann der Kurs Schritt für Schritt erweitert werden und bleibt dank des JSON-Formats leicht anpassbar.
