/**
 * Storage Adapter - Handles data persistence
 * Designed for easy switching between localStorage, SQLite, MySQL
 */

class StorageAdapter {
    constructor() {
        this.type = 'localStorage'; // Default storage type
    }

    // Mission progress operations
    async saveProgress(missionId, progressData) {
        try {
            const key = `progress_${missionId}`;
            const data = {
                ...progressData,
                lastPlayed: new Date().toISOString(),
                version: 1
            };
            
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving progress:', error);
            return false;
        }
    }

    async loadProgress(missionId) {
        try {
            const key = `progress_${missionId}`;
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Error loading progress:', error);
            return null;
        }
    }

    async loadAllProgress() {
        try {
            const progress = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('progress_')) {
                    const missionId = key.replace('progress_', '');
                    const data = localStorage.getItem(key);
                    progress[missionId] = data ? JSON.parse(data) : null;
                }
            }
            return progress;
        } catch (error) {
            console.error('Error loading all progress:', error);
            return {};
        }
    }

    // Global settings
    async saveSetting(key, value) {
        try {
            const settingKey = `setting_${key}`;
            localStorage.setItem(settingKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving setting:', error);
            return false;
        }
    }

    async loadSetting(key, defaultValue = null) {
        try {
            const settingKey = `setting_${key}`;
            const raw = localStorage.getItem(settingKey);
            return raw ? JSON.parse(raw) : defaultValue;
        } catch (error) {
            console.error('Error loading setting:', error);
            return defaultValue;
        }
    }

    // Data export/import for backup
    async exportData() {
        try {
            const data = {
                progress: await this.loadAllProgress(),
                settings: {},
                exportDate: new Date().toISOString(),
                version: 1
            };

            // Export all settings
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('setting_')) {
                    const settingKey = key.replace('setting_', '');
                    data.settings[settingKey] = await this.loadSetting(settingKey);
                }
            }

            return data;
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    async importData(data) {
        try {
            // Import progress
            if (data.progress) {
                for (const [missionId, progressData] of Object.entries(data.progress)) {
                    await this.saveProgress(missionId, progressData);
                }
            }

            // Import settings
            if (data.settings) {
                for (const [key, value] of Object.entries(data.settings)) {
                    await this.saveSetting(key, value);
                }
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data
    async clearAllData() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('progress_') || key.startsWith('setting_'))) {
                    keys.push(key);
                }
            }

            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    // Get storage statistics
    async getStorageStats() {
        try {
            const progress = await this.loadAllProgress();
            const totalMissions = Object.keys(progress).length;
            const completedMissions = Object.values(progress)
                .filter(p => p && p.status === 'completed').length;
            
            let totalScore = 0;
            let totalStars = 0;

            Object.values(progress).forEach(p => {
                if (p && p.score) totalScore += p.score;
                if (p && p.stars) totalStars += p.stars;
            });

            return {
                totalMissions,
                completedMissions,
                totalScore,
                totalStars,
                completionRate: totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return {
                totalMissions: 0,
                completedMissions: 0,
                totalScore: 0,
                totalStars: 0,
                completionRate: 0
            };
        }
    }
}

// Future extension point for different storage types
class SQLiteAdapter extends StorageAdapter {
    constructor() {
        super();
        this.type = 'sqlite';
        // TODO: Implement SQLite operations when needed
    }
}

class MySQLAdapter extends StorageAdapter {
    constructor(apiEndpoint) {
        super();
        this.type = 'mysql';
        this.apiEndpoint = apiEndpoint;
        // TODO: Implement MySQL operations when needed
    }
}

// Global storage instance
const storage = new StorageAdapter();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageAdapter, storage };
}