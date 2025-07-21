export class MissionManager {
    constructor() {
        this.tracks = [];
        this.missions = {};
    }

    async init() {
        console.log('MissionManager initializing...');
        await this.loadTracks();
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

    getMissionList() {
        const all = [];

		
        // Flatten all missions with track references
		if (!Array.isArray(this.tracks)) return all;
        
		for (const track of this.tracks) {
            //const list = this.missions[track.id] || [];
			const list = Array.isArray(this.missions[track.id]) ? this.missions[track.id] : [];

			
			console.log(list);
            for (const m of list) {
                all.push({ ...m, trackId: track.id });
            }
        }
        return all;
    }
	
	loadMission(missionId) {
		for (const track of this.tracks) {
			const list = this.missions[track.id] || [];
			const mission = list.find(m => m.id === missionId);
			if (mission) return mission;
		}
		return null;
	}

}