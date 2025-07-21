export class MissionManager {
    constructor() {
        this.tracks = [];
        this.missions = {};
    }

    async init(preloadedTracks = null) {
        console.log('MissionManager initializing...');
        if (Array.isArray(preloadedTracks)) {
            this.importTracks(preloadedTracks);
        } else {
            await this.loadTracks();
        }
        console.log('MissionManager ready.');
    }

    async loadTracks() {
        try {
            const response = await fetch('/js/missions/tracks.json');
            const data = await response.json();

            this.tracks = data;

            // Load all missions per track
			for (const track of this.tracks) {
				const missionResponse = await fetch(`/js/missions/${track.file}`);
				const missionData = await missionResponse.json();
				this.missions[track.id] = missionData.missions; // ← WICHTIG
			}

        } catch (error) {
            console.error('Fehler beim Laden der Tracks:', error);
            throw new Error('Tracks konnten nicht geladen werden.');
        }
    }

    getTrackList() {
        return this.tracks;
    }

    getMission(trackId, missionId) {
        const list = this.missions[trackId] || [];
        return list.find(m => m.id === missionId);
    }

    getMissionList(trackId = null) {
        const all = [];

        if (!Array.isArray(this.tracks)) return all;

        const tracks = trackId ? this.tracks.filter(t => t.id === trackId) : this.tracks;

        for (const track of tracks) {
            const list = Array.isArray(this.missions[track.id]) ? this.missions[track.id] : [];
            for (const m of list) {
                all.push({ ...m, trackId: track.id });
            }
        }
        return all;
    }

    importTrack(track) {
        if (!track || !track.id) return;

        const existing = this.tracks.find(t => t.id === track.id);
        if (!existing) {
            this.tracks.push({
                id: track.id,
                title: track.title,
                description: track.description,
                file: track.file || null
            });
        }

        if (track.missions) {
            this.missions[track.id] = track.missions;
        }
    }

    importTracks(trackArray) {
        if (!Array.isArray(trackArray)) return;
        for (const t of trackArray) {
            this.importTrack(t);
        }
    }

    loadMission(missionId, trackId = null) {
        const tracks = trackId ? this.tracks.filter(t => t.id === trackId) : this.tracks;
        for (const track of tracks) {
            const list = this.missions[track.id] || [];
            const mission = list.find(m => m.id === missionId);
            if (mission) return mission;
        }
        return null;
    }

}
