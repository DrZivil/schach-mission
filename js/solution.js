/**
 * Solution System - Playback and demonstration of mission solutions
 */

class SolutionSystem {
    constructor() {
        this.isPlaying = false;
        this.currentSolution = [];
        this.stepIndex = 0;
        this.originalPosition = null;
        this.playbackSpeed = 2000; // ms between moves
    }

    // Start solution playback
    async playSolution(mission, chess) {
        if (!mission || !mission.solution || !chess) {
            console.warn('No solution available for playback');
            return false;
        }

        if (this.isPlaying) {
            this.stopPlayback();
            return false;
        }

        this.currentSolution = mission.solution;
        this.stepIndex = 0;
        this.originalPosition = chess.fen();
        this.isPlaying = true;

        console.log('Starting solution playback:', this.currentSolution);

        // Show playback controls
        this.showPlaybackControls();

        // Start playback
        await this.playNextStep(chess);

        return true;
    }

    async playNextStep(chess) {
        if (!this.isPlaying || this.stepIndex >= this.currentSolution.length) {
            this.completePlayback();
            return;
        }

        const moveStr = this.currentSolution[this.stepIndex];
        console.log(`Playing step ${this.stepIndex + 1}: ${moveStr}`);

        // Highlight the move before playing it
        await this.highlightMove(moveStr, chess);

        // Wait a moment for highlight
        await this.delay(800);

        // Execute the move
        const success = await this.executeMove(moveStr, chess);
        
        if (success) {
            this.stepIndex++;
            
            // Provide commentary
            this.provideMoveCommentary(moveStr, this.stepIndex, this.currentSolution.length);
            
            // Wait before next move
            await this.delay(this.playbackSpeed);
            
            // Continue with next move
            this.playNextStep(chess);
        } else {
            console.error('Failed to execute move:', moveStr);
            this.stopPlayback();
        }
    }

    async highlightMove(moveStr, chess) {
        const move = this.parseMoveString(moveStr, chess);
        if (!move) return;

        // Highlight source square
        if (window.gameController) {
            window.gameController.highlightSquare(move.from, 'highlight-piece');
            
            // After a delay, highlight target square
            setTimeout(() => {
                if (this.isPlaying) {
                    window.gameController.highlightSquare(move.to, 'highlight-square');
                }
            }, 400);
        }
    }

    async executeMove(moveStr, chess) {
        try {
            const move = this.parseMoveString(moveStr, chess);
            if (!move) return false;

            // Execute move through game controller
            if (window.gameController) {
                const success = window.gameController.makeMove(move);
                if (success) {
                    console.log(`Executed: ${moveStr} -> ${move.from}${move.to}`);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error executing move:', error);
            return false;
        }
    }

    parseMoveString(moveStr, chess) {
        // Handle different move notation formats
        try {
            // Try direct coordinate notation first (e2e4)
            if (moveStr.length === 4 && /^[a-h][1-8][a-h][1-8]$/.test(moveStr)) {
                return {
                    from: moveStr.substring(0, 2),
                    to: moveStr.substring(2, 4)
                };
            }

            // Try algebraic notation (e4, Nf3, O-O, etc.)
            const possibleMoves = chess.moves({ verbose: true });
            const matchingMove = possibleMoves.find(move => 
                move.san === moveStr || 
                move.san === moveStr.replace('+', '') || // Remove check notation
                move.san === moveStr.replace('#', '')    // Remove mate notation
            );

            if (matchingMove) {
                return {
                    from: matchingMove.from,
                    to: matchingMove.to
                };
            }

            console.warn('Could not parse move:', moveStr);
            return null;
        } catch (error) {
            console.error('Error parsing move:', error);
            return null;
        }
    }

    provideMoveCommentary(moveStr, stepNum, totalSteps) {
        let commentary = '';

        if (stepNum === 1) {
            commentary = `Schritt ${stepNum}: ${moveStr}`;
        } else if (stepNum === totalSteps) {
            commentary = `Letzter Schritt: ${moveStr} - Lösung komplett!`;
        } else {
            commentary = `Schritt ${stepNum}: ${moveStr}`;
        }

        // Show visual feedback
        if (window.uiController) {
            window.uiController.showPositiveFeedback(commentary, 1500);
        }

        // Speak commentary if available
        if (window.speechSystem) {
            window.speechSystem.speakFeedback(commentary);
        }
    }

    showPlaybackControls() {
        // Show modal with playback controls
        const controlsHTML = `
            <div class="solution-playback">
                <h3>🎬 Lösung wird abgespielt</h3>
                <p>Die Lösung wird Schritt für Schritt demonstriert.</p>
                <div class="playback-controls">
                    <button id="pause-playback" class="btn btn-secondary">⏸️ Pausieren</button>
                    <button id="stop-playback" class="btn btn-danger">⏹️ Stoppen</button>
                    <button id="reset-position" class="btn btn-secondary">🔄 Position zurücksetzen</button>
                </div>
                <div class="playback-progress">
                    <span id="step-counter">Schritt 1 von ${this.currentSolution.length}</span>
                </div>
            </div>
        `;

        if (window.missionSchachApp) {
            window.missionSchachApp.showModal('Lösung', controlsHTML);

            // Add event listeners
            setTimeout(() => {
                const pauseBtn = document.getElementById('pause-playback');
                const stopBtn = document.getElementById('stop-playback');
                const resetBtn = document.getElementById('reset-position');

                if (pauseBtn) pauseBtn.addEventListener('click', () => this.pausePlayback());
                if (stopBtn) stopBtn.addEventListener('click', () => this.stopPlayback());
                if (resetBtn) resetBtn.addEventListener('click', () => this.resetToOriginalPosition());
            }, 100);
        }
    }

    pausePlayback() {
        this.isPlaying = false;
        console.log('Solution playback paused');
        
        if (window.uiController) {
            window.uiController.showPositiveFeedback('Wiedergabe pausiert', 1000);
        }
    }

    stopPlayback() {
        this.isPlaying = false;
        this.stepIndex = 0;
        
        // Clear highlights
        if (window.hintSystem) {
            window.hintSystem.clearHighlights();
        }

        console.log('Solution playback stopped');
        
        if (window.missionSchachApp) {
            window.missionSchachApp.hideModal();
        }
    }

    async resetToOriginalPosition() {
        if (!this.originalPosition || !window.gameController) return;

        try {
            // Reset chess position
            window.gameController.chess.load(this.originalPosition);
            
            // Re-render board
            window.gameController.renderBoard();
            
            // Reset game state
            window.gameController.moveHistory = [];
            
            console.log('Position reset to original');
            
            if (window.uiController) {
                window.uiController.showPositiveFeedback('Position zurückgesetzt', 1000);
                window.uiController.resetGoals();
            }
        } catch (error) {
            console.error('Error resetting position:', error);
        }
    }

    completePlayback() {
        this.isPlaying = false;
        
        console.log('Solution playback completed');
        
        if (window.uiController) {
            window.uiController.showSuccess('Lösung vollständig', 'Die komplette Lösung wurde demonstriert!');
        }

        // Auto-close modal after a moment
        setTimeout(() => {
            if (window.missionSchachApp) {
                window.missionSchachApp.hideModal();
            }
        }, 3000);
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Update step counter during playback
    updateStepCounter() {
        const counter = document.getElementById('step-counter');
        if (counter && this.isPlaying) {
            counter.textContent = `Schritt ${this.stepIndex + 1} von ${this.currentSolution.length}`;
        }
    }

    // Check if solution playback is active
    isPlaybackActive() {
        return this.isPlaying;
    }
}

// Global solution system instance
const solutionSystem = new SolutionSystem();
window.solutionSystem = solutionSystem;