/**
 * UI Controller - Handles user interface interactions and updates
 */

class UIController {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.initialized = true;
        console.log('UI Controller initialized');
    }

    setupEventListeners() {
        // Game control buttons
        const hintBtn = document.getElementById('hint-btn');
        const resetBtn = document.getElementById('reset-btn');  
        const solutionBtn = document.getElementById('solution-btn');
        const speakBtn = document.getElementById('speak-btn');

        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHint());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        if (solutionBtn) {
            solutionBtn.addEventListener('click', () => this.showSolution());
        }

        if (speakBtn) {
            speakBtn.addEventListener('click', () => this.toggleSpeech());
        }

        // Responsive handling
        this.setupResponsiveHandling();
    }

    setupResponsiveHandling() {
        // Handle screen resize for responsive board
        window.addEventListener('resize', () => {
            if (window.gameController && window.gameController.board) {
                window.gameController.resizeBoard();
            }
        });
    }

    // Mission UI updates
    updateMissionUI(mission) {
        this.updateMissionTitle(mission.title);
        this.updateMissionInstruction(mission.instruction);
        this.updateMissionGoals(mission.goals);
        this.updateMissionScore(0);
    }

    updateMissionTitle(title) {
        const titleElement = document.getElementById('mission-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    toggleSpeech() {
        if (window.speechSystem) {
            if (window.speechSystem.isSpeaking()) {
                window.speechSystem.stop();
            } else {
                // Read current instruction
                const instruction = document.getElementById('mission-instruction');
                if (instruction && instruction.textContent) {
                    window.speechSystem.speakInstruction(instruction.textContent);
                } else {
                    this.showPositiveFeedback('Keine Anweisung zum Vorlesen verfügbar.', 2000);
                }
            }
        } else {
            this.showNegativeFeedback('Sprachausgabe wird von diesem Browser nicht unterstützt.', 3000);
        }
    }

    updateMissionInstruction(instruction) {
        const instructionElement = document.getElementById('mission-instruction');
        if (instructionElement) {
            instructionElement.textContent = instruction;
        }
    }

    updateMissionGoals(goals) {
        const goalsElement = document.getElementById('mission-goals');
        if (goalsElement && Array.isArray(goals)) {
            goalsElement.innerHTML = goals.map(goal => 
                `<div class="goal" data-goal="${goal}">
                    <span class="goal-icon">○</span>
                    <span class="goal-text">${goal}</span>
                </div>`
            ).join('');
        }
    }

    updateMissionScore(score, maxScore = 100) {
        const scoreElement = document.getElementById('mission-score');
        if (scoreElement) {
            const stars = this.calculateDisplayStars(score, maxScore);
            scoreElement.innerHTML = stars;
        }
    }

    calculateDisplayStars(score, maxScore) {
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        const starCount = percentage >= 80 ? 3 : percentage >= 60 ? 2 : percentage >= 40 ? 1 : 0;
        
        const filled = '★'.repeat(starCount);
        const empty = '☆'.repeat(3 - starCount);
        return filled + empty;
    }

    // Goal tracking
    markGoalCompleted(goalText) {
        const goals = document.querySelectorAll('.goal');
        goals.forEach(goal => {
            const goalElement = goal.querySelector('.goal-text');
            if (goalElement && goalElement.textContent === goalText) {
                goal.classList.add('completed');
                const icon = goal.querySelector('.goal-icon');
                if (icon) {
                    icon.textContent = '✓';
                }
            }
        });
    }

    resetGoals() {
        const goals = document.querySelectorAll('.goal');
        goals.forEach(goal => {
            goal.classList.remove('completed');
            const icon = goal.querySelector('.goal-icon');
            if (icon) {
                icon.textContent = '○';
            }
        });
    }

    // Game control actions
    showHint() {
        if (window.hintSystem && window.gameController) {
            const success = window.hintSystem.showHint();
            if (!success) {
                // Fallback to basic hint
                this.showPositiveFeedback(
                    'Schaue dir die Stellung genau an und überlege, welche Figur am besten helfen kann!',
                    3000
                );
            }
        } else {
            this.showPositiveFeedback(
                'Denke daran: Schau dir die Stellung genau an und überlege, welche Figur am besten helfen kann!',
                3000
            );
        }
    }

    resetGame() {
        if (window.gameController) {
            window.gameController.resetMission();
        }
        this.resetGoals();
        this.updateMissionScore(0);
    }

    showSolution() {
        if (window.solutionSystem && window.gameController && window.gameController.currentMission) {
            const confirmCallback = () => {
                window.solutionSystem.playSolution(
                    window.gameController.currentMission,
                    window.gameController.chess
                );
                // Mark solution as shown in game controller
                if (window.gameController) {
                    window.gameController.solutionShown = true;
                }
            };

            window.missionSchachApp.showModal(
                'Lösung abspielen',
                `<p>Möchtest du dir die Lösung Schritt für Schritt ansehen?</p>
                 <p><em>Dadurch erhältst du weniger Punkte für diese Mission.</em></p>`,
                confirmCallback
            );
        } else {
            // Fallback to basic solution display
            const confirmCallback = () => {
                if (window.gameController) {
                    window.gameController.showSolution();
                }
            };

            window.missionSchachApp.showModal(
                'Lösung anzeigen',
                '<p>Möchtest du dir die Lösung anzeigen lassen? Dadurch erhältst du weniger Punkte für diese Mission.</p>',
                confirmCallback
            );
        }
    }

    // Feedback and animations
    showMoveResult(isCorrect, message = null) {
        if (isCorrect) {
            this.showPositiveFeedback(message || 'Guter Zug!');
        } else {
            this.showNegativeFeedback(message || 'Das war nicht der richtige Zug.');
        }
    }

    showPositiveFeedback(message, duration = 2000) {
        this.showTemporaryMessage(message, 'success', duration);
    }

    showNegativeFeedback(message, duration = 2000) {
        this.showTemporaryMessage(message, 'error', duration);
    }

    showTemporaryMessage(message, type = 'info', duration = 2000) {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `temp-message temp-message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        // Set color based on type
        switch (type) {
            case 'success':
                messageEl.style.backgroundColor = 'var(--success-color)';
                break;
            case 'error':
                messageEl.style.backgroundColor = 'var(--danger-color)';
                break;
            default:
                messageEl.style.backgroundColor = 'var(--primary-color)';
        }

        document.body.appendChild(messageEl);

        // Animate in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    }

    // Board UI helpers
    highlightSquare(square, className = 'highlight') {
        if (window.gameController && window.gameController.board) {
            // Implementation depends on chess board library
            console.log(`Highlighting square: ${square}`);
        }
    }

    clearHighlights() {
        if (window.gameController && window.gameController.board) {
            // Implementation depends on chess board library
            console.log('Clearing highlights');
        }
    }

    // Responsive utilities
    updateForScreenSize() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        document.body.classList.toggle('mobile', isMobile);
        document.body.classList.toggle('tablet', isTablet);
        document.body.classList.toggle('desktop', !isMobile && !isTablet);
    }

    // Mission completion UI
    showMissionComplete(missionData, score, stars) {
        const starsDisplay = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        const content = `
            <div class="mission-complete">
                <h3>🎉 Mission abgeschlossen!</h3>
                <div class="completion-stars">${starsDisplay}</div>
                <div class="completion-score">Punkte: ${score}</div>
                <div class="completion-actions">
                    <button id="next-mission-btn" class="btn btn-primary">Nächste Mission</button>
                    <button id="replay-mission-btn" class="btn btn-secondary">Wiederholen</button>
                </div>
            </div>
        `;

        window.missionSchachApp.showModal('Mission abgeschlossen!', content);

        // Add event listeners for completion actions
        setTimeout(() => {
            const nextBtn = document.getElementById('next-mission-btn');
            const replayBtn = document.getElementById('replay-mission-btn');

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    window.missionSchachApp.hideModal();
                    this.goToNextMission();
                });
            }

            if (replayBtn) {
                replayBtn.addEventListener('click', () => {
                    window.missionSchachApp.hideModal();
                    this.resetGame();
                });
            }
        }, 100);
    }

    goToNextMission() {
        // Find next available mission
        window.missionSchachApp.showScreen('mission-select');
        window.missionSchachApp.setActiveNavButton('missions-btn');
    }

    // Error handling
    showError(message, title = 'Fehler') {
        window.missionSchachApp.showError(title, message);
    }

    showSuccess(message, title = 'Erfolg') {
        window.missionSchachApp.showSuccess(title, message);
    }
}

// Global UI controller instance
const uiController = new UIController();
window.uiController = uiController;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => uiController.init());
} else {
    uiController.init();
}
