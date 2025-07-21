/**
 * Game Controller - Handles chess game logic and board interactions
 * Integrates with Chess.js for move validation and game state
 */

class GameController {
    constructor() {
        this.chess = null;
        this.board = null;
        this.currentMission = null;
        this.moveHistory = [];
        this.hintCount = 0;
        this.solutionShown = false;
        this.startTime = null;
        this.boardElement = null;
        this.selectedSquare = null;
    }

    async startMission(missionId) {
        try {
            // Load mission data
            this.currentMission = await window.missionManager.loadMission(missionId);
            if (!this.currentMission) {
                throw new Error(`Mission ${missionId} could not be loaded`);
            }

            // Initialize chess game
            this.initializeChessGame();
            
            // Update UI
            if (window.uiController) {
                window.uiController.updateMissionUI(this.currentMission);
            }

            // Initialize hint system for this mission
            if (window.hintSystem) {
                window.hintSystem.initializeForMission(
                    this.currentMission, 
                    this.chess, 
                    this.moveHistory
                );
            }

            // Create board
            this.createBoard();
            
            // Reset counters
            this.resetCounters();
            
            console.log(`Started mission: ${this.currentMission.title}`);
            
        } catch (error) {
            console.error('Error starting mission:', error);
            window.missionSchachApp.showError('Fehler', 'Mission konnte nicht geladen werden');
        }
    }

    initializeChessGame() {
        // Initialize Chess.js with mission's starting position
        this.chess = new Chess(this.currentMission.boardInitial);
        this.moveHistory = [];
        this.selectedSquare = null;
        
        console.log('Chess game initialized with FEN:', this.currentMission.boardInitial);
        console.log('Current position valid:', this.chess.fen());
    }

    createBoard() {
        const boardContainer = document.getElementById('chess-board');
        if (!boardContainer) {
            console.error('Board container not found');
            return;
        }

        // Clear existing board
        boardContainer.innerHTML = '';

        // Create board element
        this.boardElement = document.createElement('div');
        this.boardElement.id = 'board';
        boardContainer.appendChild(this.boardElement);

        // Create simple DOM-based board
        this.renderBoard();
        
        console.log('Board created and rendered');
    }

    renderBoard() {
        if (!this.boardElement || !this.chess) return;

        const position = this.chess.board();
        let boardHTML = '<div class="chess-squares">';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = String.fromCharCode(97 + col) + (8 - row);
                const piece = position[row][col];
                const isLight = (row + col) % 2 === 0;
                
                let pieceSymbol = '';
                if (piece) {
                    pieceSymbol = this.getPieceSymbol(piece);
                }

                boardHTML += `
                    <div class="square ${isLight ? 'light' : 'dark'}" 
                         data-square="${square}"
                         ${piece ? 'draggable="true"' : ''}>
                        <span class="piece">${pieceSymbol}</span>
                    </div>
                `;
            }
        }

        boardHTML += '</div>';
        
        // Add coordinate labels
        boardHTML += `
            <div class="board-coordinates rank-labels">
                <div>8</div><div>7</div><div>6</div><div>5</div>
                <div>4</div><div>3</div><div>2</div><div>1</div>
            </div>
            <div class="board-coordinates file-labels">
                <div>a</div><div>b</div><div>c</div><div>d</div>
                <div>e</div><div>f</div><div>g</div><div>h</div>
            </div>
        `;
        
        this.boardElement.innerHTML = `<div class="board-container">${boardHTML}</div>`;

        // Add click handlers
        this.addBoardEventListeners();

        // Add board CSS if not already added
        this.ensureBoardStyles();
    }

    addBoardEventListeners() {
        const squares = this.boardElement.querySelectorAll('.chess-squares .square');
        squares.forEach(square => {
            square.addEventListener('click', (e) => {
                const squareId = square.getAttribute('data-square');
                this.onSquareClick(squareId);
            });
            
            // Add drag and drop functionality
            square.addEventListener('dragstart', (e) => {
                const squareId = square.getAttribute('data-square');
                const piece = this.chess.get(squareId);
                if (piece) {
                    e.dataTransfer.setData('text/plain', squareId);
                    e.dataTransfer.effectAllowed = 'move';
                    square.classList.add('dragging');
                    this.selectedSquare = squareId;
                    this.showPossibleMoves(squareId);
                }
            });
            
            square.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                square.classList.add('drag-over');
            });
            
            square.addEventListener('dragleave', (e) => {
                square.classList.remove('drag-over');
            });
            
            square.addEventListener('drop', (e) => {
                e.preventDefault();
                square.classList.remove('drag-over');
                
                const fromSquare = e.dataTransfer.getData('text/plain');
                const toSquare = square.getAttribute('data-square');
                
                if (fromSquare && toSquare && fromSquare !== toSquare) {
                    const moveAttempt = { from: fromSquare, to: toSquare };
                    this.makeMove(moveAttempt);
                }
                
                this.clearHighlights();
                this.selectedSquare = null;
            });
            
            square.addEventListener('dragend', () => {
                square.classList.remove('dragging');
                this.clearHighlights();
            });
        });
    }

    getPieceSymbol(piece) {
        const symbols = {
            'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
            'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟'
        };
        return symbols[piece.color + piece.type] || '';
    }

    ensureBoardStyles() {
        if (document.getElementById('dynamic-board-styles')) return;

        const style = document.createElement('style');
        style.id = 'dynamic-board-styles';
        style.textContent = `
            .chess-squares {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                grid-template-rows: repeat(8, 1fr);
                width: 100%;
                height: 100%;
                aspect-ratio: 1;
                max-width: 400px;
                border: 2px solid var(--secondary-color);
                border-radius: var(--radius-sm);
                position: relative;
            }
            
            .board-container {
                position: relative;
                display: inline-block;
            }
            
            .board-coordinates {
                position: absolute;
                font-size: 12px;
                font-weight: 600;
                color: var(--secondary-color);
                user-select: none;
                pointer-events: none;
            }
            
            .rank-labels {
                left: -20px;
                top: 0;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                align-items: center;
            }
            
            .file-labels {
                bottom: -25px;
                left: 0;
                width: 100%;
                display: flex;
                justify-content: space-around;
                align-items: center;
            }
            
            .square {
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                user-select: none;
                position: relative;
                transition: background-color 0.2s ease;
            }
            
            .square.light {
                background-color: var(--light-square);
            }
            
            .square.dark {
                background-color: var(--dark-square);
            }
            
            .square.selected {
                background-color: var(--highlight-color) !important;
            }
            
            .square.possible-move {
                background-color: var(--move-hint) !important;
            }
            
            .square:hover {
                filter: brightness(1.1);
            }
            
            .square.dragging {
                opacity: 0.7;
                transform: scale(1.05);
            }
            
            .square.drag-over {
                box-shadow: inset 0 0 10px rgba(255, 215, 0, 0.8);
            }
            
            .piece {
                font-size: 2rem;
                line-height: 1;
                pointer-events: none;
            }
            
            @media (max-width: 768px) {
                .piece {
                    font-size: 1.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    onSquareClick(square) {
        if (!this.chess || !this.currentMission) return;

        console.log(`Square clicked: ${square}`);
        
        // Clear previous highlights
        this.clearHighlights();
        
        // If no square selected, select this square (if it has a piece)
        if (!this.selectedSquare) {
            const piece = this.chess.get(square);
            if (piece) {
                this.selectedSquare = square;
                this.highlightSquare(square, 'selected');
                this.showPossibleMoves(square);
                return;
            }
        }
        
        // If same square clicked, deselect
        if (this.selectedSquare === square) {
            this.selectedSquare = null;
            return;
        }
        
        // Try to make a move
        const moveAttempt = {
            from: this.selectedSquare,
            to: square
        };
        
        if (this.makeMove(moveAttempt)) {
            this.selectedSquare = null;
        } else {
            // Maybe selecting a new piece
            const piece = this.chess.get(square);
            if (piece) {
                this.selectedSquare = square;
                this.highlightSquare(square, 'selected');
                this.showPossibleMoves(square);
            } else {
                this.selectedSquare = null;
            }
        }
    }

    showPossibleMoves(fromSquare) {
        const moves = this.chess.moves({ square: fromSquare, verbose: true });
        moves.forEach(move => {
            this.highlightSquare(move.to, 'possible-move');
        });
        
        console.log(`Showing ${moves.length} possible moves from ${fromSquare}`);
    }

    highlightSquare(square, className) {
        const squareEl = this.boardElement.querySelector(`.chess-squares [data-square="${square}"]`);
        if (squareEl) {
            squareEl.classList.add(className);
        }
    }

    clearHighlights() {
        const squares = this.boardElement.querySelectorAll('.chess-squares .square');
        squares.forEach(sq => {
            sq.classList.remove('selected', 'possible-move', 'dragging', 'drag-over');
        });
    }

    makeMove(moveData) {
        if (!this.chess || !this.currentMission) return false;

        try {
            const move = this.chess.move(moveData);
            if (move) {
                this.moveHistory.push(move);
                this.renderBoard();
                
                console.log('Move made:', move.san, 'Position:', this.chess.fen());
                
                this.checkMissionGoals();
                this.checkGameEnd();
                
                if (window.uiController) {
                    window.uiController.showPositiveFeedback(`${move.san} - Guter Zug!`, 1500);
                }
                
                return true;
            }
        } catch (error) {
            console.error('Invalid move:', error, moveData);
            if (window.uiController) {
                window.uiController.showNegativeFeedback('Ungültiger Zug');
            }
        }
        
        return false;
    }

    checkMissionGoals() {
        if (!this.currentMission || !this.currentMission.goals) return;

        // Enhanced goal checking with chess.js
        this.currentMission.goals.forEach(goal => {
            let goalMet = false;
            const goalLower = goal.toLowerCase();

            if (goalLower.includes('matt')) {
                goalMet = this.chess.in_checkmate();
            } else if (goalLower.includes('schach')) {
                goalMet = this.chess.in_check();
            } else if (goalLower.includes('e2-e4') || goalLower.includes('bauern') && goalLower.includes('e4')) {
                goalMet = this.moveHistory.some(move => 
                    (move.from === 'e2' && move.to === 'e4') || move.san === 'e4'
                );
            } else if (goalLower.includes('bewege') && goalLower.includes('bauern')) {
                // Generic pawn move goal
                goalMet = this.moveHistory.some(move => move.piece === 'p');
            } else if (goalLower.includes('figur') && goalLower.includes('bewege')) {
                // Any piece moved
                goalMet = this.moveHistory.length > 0;
            } else if (goalLower.includes('klicke') && goalLower.includes('feld')) {
                // Introduction mission - field clicking
                goalMet = true; // Auto-complete for now - can be enhanced with click tracking
            } else if (goalLower.includes('gültigen zug')) {
                // Any valid move made
                goalMet = this.moveHistory.length > 0;
            } else if (goalLower.includes('schlage') || goalLower.includes('capture')) {
                // Capture move detection
                goalMet = this.moveHistory.some(move => move.captured);
            }

            if (goalMet && window.uiController) {
                window.uiController.markGoalCompleted(goal);
                console.log('Goal completed:', goal);
            }
        });

        // Check if all goals completed
        this.checkMissionCompletion();
    }

    checkMissionCompletion() {
        const completedGoals = document.querySelectorAll('.goal.completed');
        const totalGoals = document.querySelectorAll('.goal');
        
        if (completedGoals.length === totalGoals.length && totalGoals.length > 0) {
            setTimeout(() => this.completeMission(), 500); // Small delay for effect
        }
    }

    checkGameEnd() {
        if (this.chess.game_over()) {
            let reason = 'Spiel beendet';
            
            if (this.chess.in_checkmate()) {
                reason = this.chess.turn() === 'w' ? 'Schwarz gewinnt durch Matt' : 'Weiß gewinnt durch Matt';
            } else if (this.chess.in_stalemate()) {
                reason = 'Unentschieden durch Patt';
            } else if (this.chess.in_threefold_repetition()) {
                reason = 'Unentschieden durch dreifache Stellungswiederholung';
            } else if (this.chess.insufficient_material()) {
                reason = 'Unentschieden durch ungenügendes Material';
            } else if (this.chess.in_draw()) {
                reason = 'Unentschieden';
            }
            
            console.log(`Game ended: ${reason}`);
            
            if (this.chess.in_checkmate()) {
                // Mission completed through checkmate
                setTimeout(() => this.completeMission(), 1000);
            }
        }
    }

    async completeMission() {
        if (!this.currentMission) return;

        const score = this.calculateScore();
        const stars = this.calculateStars(score);
        
        // Save progress
        await window.missionManager.completeMission(
            this.currentMission.id, 
            score, 
            this.getPlayTime()
        );

        // Show completion UI
        if (window.uiController) {
            window.uiController.showMissionComplete(this.currentMission, score, stars);
        }

        console.log(`Mission completed: ${score} points, ${stars} stars`);
    }

    calculateScore() {
        let baseScore = 100;
        
        // Deduct for hints (use hint system if available)
        const hintCount = window.hintSystem ? window.hintSystem.getHintCount() : this.hintCount;
        baseScore -= (hintCount * 10);
        
        // Deduct for solution shown
        if (this.solutionShown) {
            baseScore -= 50;
        }
        
        // Deduct for extra moves
        const expectedMoves = this.currentMission.solution?.length || 1;
        const actualMoves = this.moveHistory.length;
        const extraMoves = Math.max(0, actualMoves - expectedMoves);
        baseScore -= (extraMoves * 5);
        
        return Math.max(10, baseScore);
    }

    calculateStars(score) {
        if (score >= 80) return 3;
        if (score >= 60) return 2;
        return 1;
    }

    getPlayTime() {
        if (!this.startTime) return null;
        return Math.round((Date.now() - this.startTime) / 1000);
    }

    resetCounters() {
        this.hintCount = 0;
        this.solutionShown = false;
        this.startTime = Date.now();
        this.moveHistory = [];
        this.selectedSquare = null;
    }

    resetMission() {
        if (!this.currentMission) return;
        
        this.initializeChessGame();
        this.renderBoard();
        this.resetCounters();
        
        // Reset hint system
        if (window.hintSystem) {
            window.hintSystem.initializeForMission(
                this.currentMission,
                this.chess,
                this.moveHistory
            );
        }
        
        if (window.uiController) {
            window.uiController.resetGoals();
            window.uiController.updateMissionScore(0);
        }
        
        console.log('Mission reset');
    }

    showHint() {
        this.hintCount++;
        
        let hintMessage = 'Schaue dir die Stellung genau an und überlege welche Figur am besten helfen kann.';
        
        if (this.currentMission && this.currentMission.solution && this.currentMission.solution.length > 0) {
            const nextMove = this.currentMission.solution[0];
            if (nextMove && nextMove.length >= 4) {
                const fromSquare = nextMove.substring(0, 2);
                hintMessage = `💡 Tipp: Versuche einen Zug mit der Figur auf ${fromSquare}.`;
            }
        }
        
        if (window.uiController) {
            window.uiController.showPositiveFeedback(hintMessage, 4000);
        }
        
        console.log(`Hint shown (count: ${this.hintCount})`);
    }

    showSolution() {
        this.solutionShown = true;
        
        if (this.currentMission && this.currentMission.solution && this.currentMission.solution.length > 0) {
            const solutionText = this.currentMission.solution.join(', ');
            window.missionSchachApp.showModal(
                'Lösung',
                `<p>Die Lösung ist: <strong>${solutionText}</strong></p>
                 <p><em>Du erhältst jetzt weniger Punkte für diese Mission.</em></p>`
            );
        } else {
            window.missionSchachApp.showModal(
                'Lösung',
                '<p>Für diese Mission ist keine Lösung verfügbar.</p>'
            );
        }
        
        console.log('Solution shown');
    }

    resizeBoard() {
        // Handle board resize for responsive design
        if (this.boardElement) {
            console.log('Board resized');
        }
    }

    // Cleanup
    destroy() {
        if (this.boardElement) {
            this.boardElement.innerHTML = '';
        }
        this.chess = null;
        this.currentMission = null;
        this.moveHistory = [];
        console.log('Game controller destroyed');
    }
}

// Global game controller instance
const gameController = new GameController();
window.gameController = gameController;