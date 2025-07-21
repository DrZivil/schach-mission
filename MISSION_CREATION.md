# Mission Creation Guide - Mission Schach

This guide explains how to create new missions for the Mission Schach chess learning game.

## Mission Structure Overview

Every mission consists of two parts:
1. **Mission Metadata** - Basic information displayed in the mission list
2. **Mission Data** - Detailed gameplay information loaded when the mission starts

## Mission Metadata (Mission List)

Location: `js/missions.js` → `createSampleMissions()` function

```javascript
{
    id: 'unique_mission_id',           // Unique identifier
    title: 'Mission Title',            // Display name
    level: 'Anfänger',                // Difficulty level
    type: 'tutorial',                 // Mission category
    description: 'Short description',  // Brief explanation
    difficulty: 2,                    // Numeric difficulty (1-5)
    estimatedTime: '5 min',           // Expected completion time
    unlock: 'previous_mission_id'     // Prerequisite mission (or 'available')
}
```

### Mission Levels
- `'Anfänger'` - Beginner
- `'Fortgeschritten'` - Intermediate  
- `'Experte'` - Expert

### Mission Types
- `'tutorial'` - Learning basic concepts
- `'puzzle'` - Solve chess problems
- `'tactical'` - Learn tactical motifs
- `'endgame'` - Endgame training
- `'introduction'` - First introduction lessons

### Difficulty Scale
- `1` - Very Easy (basic board interaction)
- `2` - Easy (simple moves)
- `3` - Medium (tactics, simple puzzles)
- `4` - Hard (complex puzzles)
- `5` - Expert (advanced concepts)

## Mission Data (Gameplay Details)

Location: `js/missions.js` → `createSampleMissionData()` function

```javascript
'mission_id': {
    id: 'mission_id',
    title: 'Mission Title',
    instruction: 'Detailed instructions for the player...',
    boardInitial: 'FEN_STRING',
    goals: ['Goal 1', 'Goal 2'],
    solution: ['move1', 'move2'],
    type: 'tutorial',
    scoring: { perfect: 3, good: 2, acceptable: 1 }
}
```

### Key Fields Explained

#### `instruction`
Detailed text that explains what the player should do. This text will be:
- Displayed in the game interface
- Read aloud by the text-to-speech system
- Used by the hint system for context

**Tips for good instructions:**
- Be clear and concise
- Use beginner-friendly language
- Mention specific squares when helpful (e.g., "from e2 to e4")
- Explain the chess concept being taught

#### `boardInitial` 
The starting position in FEN (Forsyth-Edwards Notation) format.

**Common starting positions:**
- Standard game start: `'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'`
- After 1.e4: `'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'`

**FEN Format:** `[pieces] [turn] [castling] [en passant] [halfmove] [fullmove]`

**Tools for FEN:**
- Use [chess.com/analysis](https://www.chess.com/analysis) to set up positions
- Use [lichess.org/editor](https://lichess.org/editor) for position editing
- Copy the FEN string from these tools

#### `goals`
Array of objectives that the player must complete. These appear as checkboxes in the UI.

```javascript
goals: [
    'Bewege den Bauern von e2 nach e4',
    'Gib dem König Schach',
    'Schlage die Dame'
]
```

**Goal Detection:**
The system automatically detects common goals:
- Moves containing `'matt'` → Checkmate detection
- Moves containing `'schach'` → Check detection  
- Moves containing `'bewege'` + `'bauern'` → Any pawn move
- Moves containing `'bewege'` + `'figur'` → Any piece move
- Specific moves like `'e2-e4'` → Exact move detection

#### `solution`
Array of correct moves in algebraic notation.

```javascript
// Single move
solution: ['e4']

// Multiple moves
solution: ['e4', 'e5', 'Nf3']

// Alternative solutions
solution: ['Bb5+', 'Qb3', 'Nd5']  // Any of these moves works
```

**Move Notation:**
- Standard algebraic: `'e4'`, `'Nf3'`, `'O-O'`
- With check: `'Bb5+'`
- With checkmate: `'Qh7#'`
- Captures: `'exd5'`, `'Nxf7'`
- Pawn promotion: `'e8=Q'`

#### `scoring`
Point values for different performance levels.

```javascript
scoring: {
    perfect: 3,    // 3 stars - no hints, optimal moves
    good: 2,       // 2 stars - few hints, some extra moves  
    acceptable: 1  // 1 star - many hints or many extra moves
}
```

## Mission Types in Detail

### Tutorial Missions
**Purpose:** Teach basic chess concepts

```javascript
{
    type: 'tutorial',
    instruction: 'Learn how pawns move. Click on the pawn at e2, then click e4.',
    goals: ['Move the pawn forward'],
    // Simple, educational positions
}
```

### Puzzle Missions  
**Purpose:** Solve specific chess problems

```javascript
{
    type: 'puzzle', 
    instruction: 'White to move. Find the checkmate in 1 move.',
    goals: ['Checkmate the black king'],
    // Tactical positions with clear solutions
}
```

### Tactical Missions
**Purpose:** Learn tactical patterns

```javascript
{
    type: 'tactical',
    instruction: 'Find the fork that wins material.',
    goals: ['Execute a knight fork'],
    // Positions demonstrating tactics like pins, forks, skewers
}
```

### Introduction Missions
**Purpose:** First-time user orientation

```javascript
{
    type: 'introduction',
    instruction: 'Welcome! Click on square e4 to learn board coordinates.',
    goals: ['Click on the e4 square'],
    // Interactive board exploration
}
```

## Progressive Difficulty Guidelines

### Beginner Path (Difficulty 1-2)
1. **Board Basics** - Squares, coordinates, piece identification
2. **First Moves** - How pieces move, basic captures
3. **Special Rules** - Castling, en passant, promotion
4. **Check/Checkmate** - King safety concepts

### Intermediate Path (Difficulty 3-4)
1. **Simple Tactics** - Forks, pins, skewers
2. **Mate in 1-2** - Basic mating patterns
3. **Piece Coordination** - Working pieces together
4. **Opening Principles** - Development, center control

### Advanced Path (Difficulty 5)
1. **Complex Tactics** - Combinations, sacrifices
2. **Endgame Technique** - Basic endgames
3. **Strategic Concepts** - Pawn structure, weak squares
4. **Pattern Recognition** - Advanced motifs

## Testing Your Missions

### Checklist
- [ ] FEN string is valid (test in chess editor)
- [ ] Instructions are clear and educational
- [ ] Goals are achievable from the starting position
- [ ] Solution moves are correct and optimal
- [ ] Difficulty matches the content
- [ ] Mission unlocks logically from previous mission

### Testing Process
1. Add mission to `createSampleMissions()`
2. Add mission data to `createSampleMissionData()`
3. Test in browser:
   - Load the game
   - Play through the mission
   - Verify goals complete correctly
   - Test hint system
   - Test solution playback

## Advanced Features

### Custom Goal Detection
For complex goals, modify `checkMissionGoals()` in `game.js`:

```javascript
// Add custom goal detection
if (goalLower.includes('your_custom_goal')) {
    goalMet = /* your detection logic */;
}
```

### Dynamic Positions
For missions that should start from variable positions:

```javascript
// Generate random position
boardInitial: generateRandomPosition(),

// Or use position generator
boardInitial: createTacticalPosition('fork')
```

### Multi-Stage Missions
For missions with multiple phases:

```javascript
goals: [
    'Phase 1: Move your pieces to attack',
    'Phase 2: Execute the tactical blow', 
    'Phase 3: Convert your advantage'
],
solution: ['Nf5', 'Nxe7+', 'Nxf7']
```

## Common Patterns

### Teaching Piece Movement
```javascript
{
    instruction: 'Bishops move diagonally. Move the bishop from c1 to f4.',
    boardInitial: '8/8/8/8/8/8/8/2B5 w - - 0 1', // Isolated bishop
    goals: ['Move bishop diagonally'],
    solution: ['Bf4']
}
```

### Teaching Captures
```javascript
{
    instruction: 'Capture the undefended piece.',
    boardInitial: 'r6k/8/8/4n3/3Q4/8/8/7K w - - 0 1',
    goals: ['Capture the knight'],
    solution: ['Qxe5']
}
```

### Teaching Check
```javascript
{
    instruction: 'Give check to force the king to move.',
    boardInitial: '4k3/8/8/8/8/8/8/R7 w - - 0 1',
    goals: ['Give check'],
    solution: ['Ra8+', 'Re1+']
}
```

### Teaching Mate
```javascript
{
    instruction: 'Deliver checkmate! The king has no escape.',
    boardInitial: '6k1/5ppp/8/8/8/8/8/R6R w - - 0 1',
    goals: ['Checkmate'],
    solution: ['Ra8#']
}
```

## Accessibility Considerations

### Text-to-Speech Friendly
- Write instructions that sound natural when spoken
- Avoid complex punctuation that confuses TTS
- Use clear, simple sentences

### Visual Clarity
- Goals should be specific enough to highlight relevant pieces
- Instructions should mention specific squares for visual guidance
- Use descriptive language ("the white pawn on e2")

### Beginner Friendly
- Explain chess concepts, don't assume knowledge
- Use consistent terminology
- Build concepts progressively

## File Locations Reference

```
mission-schach/
├── js/
│   ├── missions.js          # Main mission system
│   ├── game.js             # Goal detection logic
│   ├── hints.js            # Hint generation
│   └── solution.js         # Solution playback
└── MISSION_CREATION.md     # This guide
```

## Example: Complete Mission

```javascript
// In createSampleMissions()
{
    id: 'tactics_pin_01',
    title: 'Die Fesselung',
    level: 'Fortgeschritten',
    type: 'tactical',
    description: 'Lerne das taktische Motiv der Fesselung',
    difficulty: 3,
    estimatedTime: '7 min',
    unlock: 'tactics_fork_01'
}

// In createSampleMissionData()
'tactics_pin_01': {
    id: 'tactics_pin_01',
    title: 'Die Fesselung',
    instruction: 'Eine Fesselung bedeutet, dass eine Figur nicht ziehen kann, weil sie eine wichtigere Figur dahinter schützt. Fessle den schwarzen Springer mit deinem Läufer.',
    boardInitial: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4',
    goals: [
        'Fessle den Springer auf f6',
        'Der Springer kann nicht mehr ziehen'
    ],
    solution: ['Bg5'],
    type: 'tactical',
    scoring: { perfect: 3, good: 2, acceptable: 1 }
}
```

This creates a complete mission teaching the pin tactic, with proper progression, clear instructions, and appropriate difficulty.

## Need Help?

For questions about mission creation:
1. Check existing missions in `missions.js` for examples
2. Test thoroughly in the browser
3. Consider the learning progression
4. Make sure instructions are beginner-friendly

Happy mission creating! 🎯♟️
