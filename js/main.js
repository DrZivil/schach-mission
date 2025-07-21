
import { loadTracks } from './mission-loader.js';
import { MissionManager } from './mission-manager.js';

class MissionSchachApp {
    constructor() {
        this.currentScreen = 'mission-select';
        this.currentMission = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            this.showLoading(true);

            await this.initializeStorage();
            await this.initializeMissions();
            this.initializeUI();
            this.initializeEventListeners();

            this.showScreen('mission-select');
            this.isInitialized = true;
            console.log('Mission Schach App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Fehler beim Laden der Anwendung', error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async initializeStorage() {
        const testResult = await storage.saveSetting('app_initialized', true);
        if (!testResult) {
            throw new Error('Storage initialization failed');
        }
    }

    async initializeMissions() {
        const tracks = await loadTracks();
        window.missionManager = new MissionManager(tracks);
        window.missionManager.init();
        console.log('Mission system initialized with tracks:', tracks.map(t => t.id).join(', '));
    }

    initializeUI() {
        console.log('UI initialized');
    }

    initializeEventListeners() {
        const missionsBtn = document.getElementById('missions-btn');
        const progressBtn = document.getElementById('progress-btn');
        const backBtn = document.getElementById('back-btn');
        const homeBtn = document.getElementById('home-btn');
        const homeProgressBtn = document.getElementById('home-progress-btn');

        if (missionsBtn) missionsBtn.addEventListener('click', () => {
            this.showScreen('mission-select');
            this.setActiveNavButton('missions-btn');
        });

        if (progressBtn) progressBtn.addEventListener('click', () => {
            this.showScreen('progress-screen');
            this.setActiveNavButton('progress-btn');
        });

        if (backBtn) backBtn.addEventListener('click', () => {
            this.showScreen('mission-select');
            this.setActiveNavButton('missions-btn');
        });

        if (homeBtn) homeBtn.addEventListener('click', () => this.goToMissionOverview());
        if (homeProgressBtn) homeProgressBtn.addEventListener('click', () => this.goToMissionOverview());

        const modalClose = document.getElementById('modal-close');
        const modalOk = document.getElementById('modal-ok');
        const modal = document.getElementById('modal');

        if (modalClose) modalClose.addEventListener('click', () => this.hideModal());
        if (modalOk) modalOk.addEventListener('click', () => this.hideModal());
        if (modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                if (this.currentScreen === 'game-screen') this.goToMissionOverview();
            }
            if (e.key === 'h' || e.key === 'H') {
                if (!e.target.matches('input, textarea')) {
                    this.goToMissionOverview();
                }
            }
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            this.currentScreen = screenId;
            this.loadScreenContent(screenId);
        }
    }

	async loadScreenContent(screenId) {
		if (screenId === 'mission-select' && window.missionManager) {
			const missions = window.missionManager.getMissionList();
			const grid = document.getElementById('mission-grid');
				if (!grid) return;

				grid.innerHTML = missions.map(mission => `
					<div class="mission-card" data-mission="${mission.id}">
						<h3>${mission.title || 'Kein Titel'}</h3>
						<p>${mission.instruction || 'Keine Beschreibung verfügbar'}</p>
						<button class="btn btn-primary">Start</button>
					</div>
				`).join('');


		// Click handler
		grid.querySelectorAll('.mission-card').forEach(card => {
			card.querySelector('button').addEventListener('click', () => {
				const missionId = card.dataset.mission;
				window.missionSchachApp.startMission(missionId);
			});
		});
	}
	else if (screenId === 'progress-screen') {
		await this.loadProgressStats();
	}
}


    setActiveNavButton(buttonId) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const target = document.getElementById(buttonId);
        if (target) target.classList.add('active');
    }

    async loadProgressStats() {
        try {
            const stats = await storage.getStorageStats();
            const container = document.getElementById('progress-stats');
            if (container) {
                container.innerHTML = `
                    <div class="stat-row"><span class="stat-label">Missionen gespielt</span><span class="stat-value">${stats.totalMissions}</span></div>
                    <div class="stat-row"><span class="stat-label">Missionen abgeschlossen</span><span class="stat-value">${stats.completedMissions}</span></div>
                    <div class="stat-row"><span class="stat-label">Abschlussrate</span><span class="stat-value">${Math.round(stats.completionRate)}%</span></div>
                    <div class="stat-row"><span class="stat-label">Gesamtpunkte</span><span class="stat-value">${stats.totalScore}</span></div>
                    <div class="stat-row"><span class="stat-label">Sterne erhalten</span><span class="stat-value">${stats.totalStars} ⭐</span></div>
                `;
            }
        } catch (error) {
            console.error('Error loading progress stats:', error);
        }
    }

    showLoading(show = true) {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.toggle('hidden', !show);
    }

    showModal(title, content, callback = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalOk = document.getElementById('modal-ok');
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            modal.classList.remove('hidden');
            if (callback && modalOk) {
                modalOk.onclick = () => {
                    this.hideModal();
                    callback();
                };
            }
        }
    }

    hideModal() {
        const modal = document.getElementById('modal');
        if (modal) modal.classList.add('hidden');
    }

    showError(title, message) {
        this.showModal(title, `<p style="color: var(--danger-color);">${message}</p>`);
    }

    showSuccess(title, message) {
        this.showModal(title, `<p style="color: var(--success-color);">${message}</p>`);
    }

    startMission(missionId) {
        this.currentMission = missionId;
        this.showScreen('game-screen');
        if (window.gameController) {
            window.gameController.startMission(missionId);
        }
    }

    goToMissionOverview() {
        if (this.currentScreen === 'game-screen' && this.currentMission) {
            this.showModal(
                'Mission verlassen',
                '<p>Möchtest du zur Missionübersicht zurückkehren? Der aktuelle Fortschritt geht verloren.</p>',
                () => {
                    this.currentMission = null;
                    this.showScreen('mission-select');
                    this.setActiveNavButton('missions-btn');
                }
            );
        } else {
            this.showScreen('mission-select');
            this.setActiveNavButton('missions-btn');
        }
    }
	
	await this.initializeMissions();
	this.showScreen('mission-select');
	this.initializeUI();
	this.initializeEventListeners();
	await this.loadScreenContent('mission-select'); // ← direkt laden!

}

const app = new MissionSchachApp();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
window.missionSchachApp = app;
