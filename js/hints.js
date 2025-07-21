/**
 * Hint System - Advanced hints with visual highlighting and speech
 */

class HintSystem {
    constructor() {
        this.currentHints = [];
        this.hintLevel = 0;
        this.maxHintLevel = 3;
    }

    // Generate hints based on mission and current position
    generateHints(mission, chess, moveHistory) {
        if (!mission || !chess) return [];

        const hints = [];
        const currentPosition = chess.fen();
        
        // Level 1: General guidance
        hints.push({
            level: 1,
            text: this.getGeneralHint(mission, chess),
            highlights: []
        });

        // Level 2: Piece-specific guidance
        if (mission.solution && mission.solution.length > 0) {
            const nextMove = this.parseSolutionMove(mission.solution[0]);
            if (nextMove) {
                hints.push({
                    level: 2,
                    text: `Schaue dir die Figur auf ${nextMove.from} genau an. Was kann sie erreichen?`,
                    highlights: [
                        { type: 'piece', square: nextMove.from }
                    ]
                });
            }
        }

        // Level 3: Show target squares
        if (mission.solution && mission.solution.length > 0) {
            const nextMove = this.parseSolutionMove(mission.solution[0]);
            if (nextMove) {
                hints.push({
                    level: 3,
                    text: `Versuche, die Figur von ${nextMove.from} nach ${nextMove.to} zu bewegen.`,
                    highlights: [
                        { type: 'piece', square: nextMove.from },
                        { type: 'square', square: nextMove.to }
                    ]
                });
            }
        }

        return hints;
    }

    getGeneralHint(mission, chess) {
        const missionType = mission.type || 'general';
        
        switch (missionType) {
            case 'tutorial':
                return 'Klicke auf die Figur, die du bewegen möchtest, und dann auf das Zielfeld.';
            case 'puzzle':
                if (chess.in_check()) {
                    return 'Der König steht im Schach! Du musst eine Lösung finden.';
                }
                return 'Analysiere die Stellung sorgfältig. Welche Figur kann das Problem lösen?';
            case 'tactical':
                return 'Suche nach taktischen Motiven. Gibt es eine Gabel, Fesselung oder andere Taktik?';
            case 'endgame':
                return 'Im Endspiel ist jeder Zug wichtig. Denke langfristig.';
            default:
                return 'Schaue dir alle Figuren an und überlege, welche am besten helfen kann.';
        }
    }

    parseSolutionMove(moveStr) {
        if (!moveStr) return null;

        // Handle different move formats
        if (moveStr.length === 4) {
            // Format: e2e4
            return {
                from: moveStr.substring(0, 2),
                to: moveStr.substring(2, 4)
            };
        }

        if (moveStr.length === 5 && moveStr.includes('-')) {
            // Format: e2-e4
            const parts = moveStr.split('-');
            return {
                from: parts[0],
                to: parts[1]
            };
        }

        // For algebraic notation (e4, Nf3), we'd need more complex parsing
        // For now, return null and provide general hints
        return null;
    }

    showHint(level = null) {
        if (this.currentHints.length === 0) {
            console.warn('No hints available');
            return false;
        }

        // Use provided level or increment current level
        if (level !== null) {
            this.hintLevel = level;
        } else {
            this.hintLevel = Math.min(this.hintLevel + 1, this.maxHintLevel);
        }

        // Find hint for current level
        const hint = this.currentHints.find(h => h.level === this.hintLevel) || 
                    this.currentHints[this.currentHints.length - 1];

        if (hint) {
            this.displayHint(hint);
            return true;
        }

        return false;
    }

    displayHint(hint) {
        // Show text hint
        if (window.uiController) {
            window.uiController.showPositiveFeedback(hint.text, 4000);
        }

        // Speak hint if available
        if (window.speechSystem) {
            window.speechSystem.speakHint(hint.text);
        }

        // Apply visual highlights
        this.applyHighlights(hint.highlights);

        console.log(`Hint level ${hint.level}:`, hint.text);
    }

    applyHighlights(highlights) {
        if (!highlights || highlights.length === 0) return;

        // Clear existing highlights first
        this.clearHighlights();

        highlights.forEach(highlight => {
            const square = highlight.square;
            const type = highlight.type;

            if (window.gameController && window.gameController.boardElement) {
                const squareElement = window.gameController.boardElement
                    .querySelector(`.chess-squares [data-square="${square}"]`);

                if (squareElement) {
                    if (type === 'piece') {
                        squareElement.classList.add('highlight-piece');
                    } else if (type === 'square') {
                        squareElement.classList.add('highlight-square');
                    }
                }
            }
        });

        // Auto-clear highlights after some time
        setTimeout(() => {
            this.clearHighlights();
        }, 5000);
    }

    clearHighlights() {
        if (window.gameController && window.gameController.boardElement) {
            const highlightedElements = window.gameController.boardElement
                .querySelectorAll('.chess-squares .highlight-piece, .chess-squares .highlight-square');
            
            highlightedElements.forEach(el => {
                el.classList.remove('highlight-piece', 'highlight-square');
            });
        }
    }

    // Initialize hints for a mission
    initializeForMission(mission, chess, moveHistory = []) {
        this.currentHints = this.generateHints(mission, chess, moveHistory);
        this.hintLevel = 0;
        this.clearHighlights();
        
        console.log(`Initialized ${this.currentHints.length} hints for mission:`, mission.id);
    }

    // Reset hint system
    reset() {
        this.currentHints = [];
        this.hintLevel = 0;
        this.clearHighlights();
    }

    // Get hint count for scoring
    getHintCount() {
        return this.hintLevel;
    }
}

// Global hint system instance
const hintSystem = new HintSystem();
window.hintSystem = hintSystem;
