// Gravity Grid Game Logic

// Initialize game constants
const ROWS = 6;
const COLS = 7;

// Initialize game state variables
let boardState = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = 'Blue';
let scores = { blue: 0, green: 0 };
let totalTurns = 40;
let player1Name = 'Blue';
let player2Name = 'Green';
let isAIMode = false;
let isAIvsAI = false;
let ai1Difficulty = 'easy';
let ai2Difficulty = 'easy';
let isAnimating = false;
let lastDropPosition = null;
let isMusicPlaying = false;

// Wait for DOM to be fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    const elements = {
        board: document.getElementById('board'),
        currentPlayerDisplay: document.getElementById('current-player'),
        blueScoreDisplay: document.getElementById('blue-score'),
        greenScoreDisplay: document.getElementById('green-score'),
        restartButton: document.getElementById('restart'),
        startButton: document.getElementById('start-button'),
        startScreen: document.getElementById('start-screen'),
        gameScreen: document.getElementById('game'),
        blueTurnsDisplay: document.getElementById('blue-turns'),
        greenTurnsDisplay: document.getElementById('green-turns'),
        saveButton: document.getElementById('save-button'),
        loadButton: document.getElementById('load-button'),
        gameModeSelect: document.getElementById('game-mode'),
        aiOptions: document.getElementById('ai-options'),
        aiDifficultySelect: document.getElementById('ai-difficulty'),
        backgroundMusic: document.getElementById('background-music'),
        musicToggle: document.getElementById('music-toggle')
    };

    // Initialize audio if elements exist
    if (elements.backgroundMusic) {
        elements.backgroundMusic.volume = 0.225;
    }

    // Add event listeners only if elements exist
    if (elements.musicToggle && elements.backgroundMusic) {
        elements.musicToggle.addEventListener('click', () => {
            if (isMusicPlaying) {
                elements.backgroundMusic.pause();
                elements.musicToggle.textContent = '🔇';
                elements.musicToggle.classList.add('muted');
            } else {
                elements.backgroundMusic.play();
                elements.musicToggle.textContent = '🔊';
                elements.musicToggle.classList.remove('muted');
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }

    // Update the game mode change handler
    if (elements.gameModeSelect) {
        elements.gameModeSelect.addEventListener('change', (e) => {
            const mode = e.target.value;
            isAIMode = mode === 'ai';
            isAIvsAI = mode === 'ai-vs-ai';
            console.log('Game mode changed to:', mode);
            
            // Get all option containers
            const aiOptions = document.getElementById('ai-options');
            const ai2Option = document.querySelector('.ai2-option');
            const player1Input = document.getElementById('player1-name');
            const player2Input = document.getElementById('player2-name');
            
            // First hide all AI options
            if (aiOptions) {
                aiOptions.classList.add('hidden');
            }
            if (ai2Option) {
                ai2Option.classList.add('hidden');
            }
            
            // Then show relevant options based on mode
            if (mode === 'ai') {
                // Human vs AI mode
                if (aiOptions) {
                    aiOptions.classList.remove('hidden');
                    const ai1Label = document.querySelector('label[for="ai1-difficulty"]');
                    if (ai1Label) ai1Label.textContent = 'AI Difficulty:';
                }
                
                if (player1Input && player2Input) {
                    player1Input.disabled = false;
                    player1Input.value = '';
                    player1Input.placeholder = 'Blue';
                    
                    player2Input.value = 'AI';
                    player2Input.disabled = true;
                    ai2Difficulty = document.getElementById('ai1-difficulty').value;
                    ai1Difficulty = 'none';
                }
            } else if (mode === 'ai-vs-ai') {
                // AI vs AI mode
                if (aiOptions) {
                    aiOptions.classList.remove('hidden');
                    if (ai2Option) ai2Option.classList.remove('hidden');
                    const ai1Label = document.querySelector('label[for="ai1-difficulty"]');
                    if (ai1Label) ai1Label.textContent = 'AI 1 Difficulty:';
                }
                
                if (player1Input && player2Input) {
                    player1Input.value = 'AI 1';
                    player2Input.value = 'AI 2';
                    player1Input.disabled = true;
                    player2Input.disabled = true;
                    ai1Difficulty = document.getElementById('ai1-difficulty').value;
                    ai2Difficulty = document.getElementById('ai2-difficulty').value;
                }
            } else {
                // Human vs Human mode
                if (player1Input && player2Input) {
                    player1Input.disabled = false;
                    player2Input.disabled = false;
                    player1Input.value = '';
                    player2Input.value = '';
                    player1Input.placeholder = 'Blue';
                    player2Input.placeholder = 'Green';
                    ai1Difficulty = 'none';
                    ai2Difficulty = 'none';
                }
            }
        });
    }

    // Add AI difficulty change handler
    if (elements.aiDifficultySelect) {
        elements.aiDifficultySelect.addEventListener('change', (e) => {
            aiDifficulty = e.target.value;
            console.log('AI difficulty set to:', aiDifficulty);
        });
    }

    // Add save/load handlers
    if (elements.saveButton) {
        elements.saveButton.addEventListener('click', saveGameState);
    }
    if (elements.loadButton) {
        elements.loadButton.addEventListener('click', loadGameState);
    }

    // Add restart handler
    if (elements.restartButton) {
        elements.restartButton.addEventListener('click', restartGame);
    }

    // Initialize the game board if it exists
    if (elements.board) {
        createBoard(elements);
    }

    // Add start button handler
    if (elements.startButton) {
        elements.startButton.addEventListener('click', () => {
            startGame(elements);
        });
    }

    // Rest of your existing functions here, but pass 'elements' as parameter where needed
    // ... existing functions ...

    // Initialize displays if they exist
    if (elements.currentPlayerDisplay) {
        updateCurrentPlayerDisplay(elements);
    }
});

function updateTurns(elements) {
    if (!elements.blueTurnsDisplay || !elements.greenTurnsDisplay) return;
    
    // Handle unlimited turns
    if (totalTurns === 999) {
        elements.blueTurnsDisplay.textContent = '∞';
        elements.greenTurnsDisplay.textContent = '∞';
        return;
    }
    
    // Calculate turns for each player
    const turnsPerPlayer = Math.max(0, totalTurns) / 2;
    const blueTurns = Math.max(0, currentPlayer === player1Name ? Math.ceil(turnsPerPlayer) : Math.floor(turnsPerPlayer));
    const greenTurns = Math.max(0, currentPlayer === player2Name ? Math.ceil(turnsPerPlayer) : Math.floor(turnsPerPlayer));
    
    // Update display
    elements.blueTurnsDisplay.textContent = blueTurns;
    elements.greenTurnsDisplay.textContent = greenTurns;
}

function updateCurrentPlayerDisplay(elements) {
    elements.currentPlayerDisplay.textContent = currentPlayer;
    elements.currentPlayerDisplay.style.color = currentPlayer === player1Name ? '#1E90FF' : '#32CD32';
}

function startGame(elements) {
    const player1Input = document.getElementById('player1-name');
    const player2Input = document.getElementById('player2-name');
    const gameModeSelect = document.getElementById('game-mode');
    const ai1DifficultySelect = document.getElementById('ai1-difficulty');
    const ai2DifficultySelect = document.getElementById('ai2-difficulty');
    const roundsSelect = document.getElementById('rounds');
    const backgroundMusic = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');

    const gameMode = gameModeSelect ? gameModeSelect.value : 'human';
    isAIMode = gameMode === 'ai';
    isAIvsAI = gameMode === 'ai-vs-ai';

    if (isAIvsAI) {
        player1Name = 'AI 1';
        player2Name = 'AI 2';
        ai1Difficulty = ai1DifficultySelect ? ai1DifficultySelect.value : 'easy';
        ai2Difficulty = ai2DifficultySelect ? ai2DifficultySelect.value : 'easy';
    } else if (isAIMode) {
        player1Name = player1Input ? player1Input.value || 'Blue' : 'Blue';
        player2Name = 'AI';
        ai2Difficulty = ai1DifficultySelect ? ai1DifficultySelect.value : 'easy';
    } else {
        player1Name = player1Input ? player1Input.value || 'Blue' : 'Blue';
        player2Name = player2Input ? player2Input.value || 'Green' : 'Green';
    }

    // Update player names display
    const blueInfo = document.querySelector('#blue-info span');
    const greenInfo = document.querySelector('#green-info span');
    if (blueInfo) blueInfo.textContent = player1Name;
    if (greenInfo) greenInfo.textContent = player2Name;

    // Start background music
    if (backgroundMusic && musicToggle) {
        backgroundMusic.play().catch(error => {
            console.log('Auto-play was prevented. Please click the music button to start the music.');
        });
        musicToggle.textContent = '🔊';
        musicToggle.classList.remove('muted');
        isMusicPlaying = true;
    }

    // Set up game rounds
    if (roundsSelect) {
        const selectedRounds = roundsSelect.value;
        totalTurns = selectedRounds === 'unlimited' ? 999 : parseInt(selectedRounds) * 2;
        
        // Show/hide turn counters
        document.querySelectorAll('.turns-left').forEach(el => {
            el.style.display = selectedRounds === 'unlimited' ? 'none' : 'block';
        });
    }

    // Start game
    currentPlayer = player1Name;
    updateCurrentPlayerDisplay(elements);
    createBoard(elements);
    updateTurns(elements);
    elements.startScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');

    // Trigger first AI move in AI vs AI mode
    if (isAIvsAI) {
        setTimeout(() => {
            makeAIMove(elements);
        }, 1000);
    }
}

function createBoard(elements) {
    elements.board.innerHTML = '';
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => dropDisc(col, elements));
            elements.board.appendChild(cell);
        }
    }
}

function dropDisc(col, elements) {
    if (!isValidMove(col) || isAnimating) return;
    
    // Remove highlight from previous last drop
    if (lastDropPosition) {
        const lastCell = document.querySelector(`[data-row="${lastDropPosition.row}"][data-col="${lastDropPosition.col}"]`);
        if (lastCell) {
            lastCell.classList.remove('last-drop');
        }
    }
    
    for (let row = 5; row >= 0; row--) {
        if (!boardState[row][col]) {
            const color = currentPlayer === player1Name ? 'blue' : 'green';
            boardState[row][col] = color;
            
            // Force immediate update of the cell's class and add last-drop highlight
            const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cellElement.className = ''; // Clear existing classes
            requestAnimationFrame(() => {
                cellElement.classList.add(color);
                cellElement.classList.add('last-drop');
            });
            
            // Store the last drop position
            lastDropPosition = { row, col };
            
            isAnimating = true;
            updateBoard(elements);
            checkForMatches(elements);
            switchPlayer(elements);
            checkForEndGame(elements);
            
            // Reset animation lock after all animations complete
            setTimeout(() => {
                isAnimating = false;
            }, 800); // Slightly longer than the animation duration to ensure all animations complete
            break;
        }
    }
}

function isValidMove(col) {
    // Check if column is within bounds
    if (col < 0 || col >= COLS) return false;
    // Check if column is full
    return boardState[0][col] === null;
}

function updateBoard(elements) {
    let piecesDropped = false;
    
    // Remove any existing falling classes
    document.querySelectorAll('.falling').forEach(cell => cell.classList.remove('falling'));
    
    // Start from the bottom row, excluding the last row
    for (let row = ROWS - 2; row >= 0; row--) {
        for (let col = 0; col < COLS; col++) {
            if (boardState[row][col]) {
                let currentRow = row;
                // Check how many empty spaces are below
                while (currentRow + 1 < ROWS && !boardState[currentRow + 1][col]) {
                    isAnimating = true;
                    // Move the piece down
                    boardState[currentRow + 1][col] = boardState[currentRow][col];
                    boardState[currentRow][col] = null;
                    
                    // Add falling animation class
                    const targetCell = document.querySelector(`[data-row="${currentRow + 1}"][data-col="${col}"]`);
                    targetCell.classList.add(boardState[currentRow + 1][col].toLowerCase(), 'falling');
                    
                    const sourceCell = document.querySelector(`[data-row="${currentRow}"][data-col="${col}"]`);
                    sourceCell.classList.remove(boardState[currentRow + 1][col].toLowerCase());
                    
                    currentRow++;
                    piecesDropped = true;
                }
            }
        }
    }

    // Update the visual board after all movements
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (boardState[row][col]) {
                cell.className = boardState[row][col].toLowerCase();
            } else {
                cell.className = '';
            }
        }
    }

    // If pieces were dropped, check for new matches after animation
    if (piecesDropped) {
        setTimeout(() => {
            checkForMatches(elements);
        }, 400);
    } else {
        isAnimating = false;
    }
}

function cascadeTiles(elements) {
    for (let col = 0; col < 7; col++) {
        let newColumn = boardState.map(row => row[col]).filter(cell => cell !== null);
        while (newColumn.length < 6) {
            newColumn.unshift(null);
        }
        for (let row = 0; row < 6; row++) {
            if (boardState[row][col] !== newColumn[row]) {
                const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cellElement.classList.add('cascade');
                setTimeout(() => {
                    boardState[row][col] = newColumn[row];
                    cellElement.classList.remove('cascade');
                    updateBoard(elements);
                }, 500);
            }
        }
    }
}

function checkForMatches(elements) {
    let matchFound = false;
    const matches = new Set(); // Using Set to avoid counting same position twice
    
    // Check horizontal matches
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            if (boardState[row][col]) {
                let matchLength = 1;
                let currentColor = boardState[row][col];
                
                // Count consecutive pieces of same color
                while (col + matchLength < COLS && 
                       boardState[row][col + matchLength] === currentColor) {
                    matchLength++;
                }
                
                // If we found 4 or more in a row, add all positions
                if (matchLength >= 4) {
                    matchFound = true;
                    for (let i = 0; i < matchLength; i++) {
                        matches.add(`${row},${col + i}`);
                    }
                }
            }
        }
    }
    
    // Check vertical matches
    for (let row = 0; row < ROWS - 3; row++) {
        for (let col = 0; col < COLS; col++) {
            if (boardState[row][col]) {
                let matchLength = 1;
                let currentColor = boardState[row][col];
                
                // Count consecutive pieces of same color
                while (row + matchLength < ROWS && 
                       boardState[row + matchLength][col] === currentColor) {
                    matchLength++;
                }
                
                // If we found 4 or more in a row, add all positions
                if (matchLength >= 4) {
                    matchFound = true;
                    for (let i = 0; i < matchLength; i++) {
                        matches.add(`${row + i},${col}`);
                    }
                }
            }
        }
    }
    
    // Check diagonal matches (top-left to bottom-right)
    for (let row = 0; row < ROWS - 3; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            if (boardState[row][col]) {
                let matchLength = 1;
                let currentColor = boardState[row][col];
                
                // Count consecutive pieces of same color
                while (row + matchLength < ROWS && 
                       col + matchLength < COLS && 
                       boardState[row + matchLength][col + matchLength] === currentColor) {
                    matchLength++;
                }
                
                // If we found 4 or more in a row, add all positions
                if (matchLength >= 4) {
                    matchFound = true;
                    for (let i = 0; i < matchLength; i++) {
                        matches.add(`${row + i},${col + i}`);
                    }
                }
            }
        }
    }
    
    // Check diagonal matches (top-right to bottom-left)
    for (let row = 0; row < ROWS - 3; row++) {
        for (let col = COLS - 1; col >= 3; col--) {
            if (boardState[row][col]) {
                let matchLength = 1;
                let currentColor = boardState[row][col];
                
                // Count consecutive pieces of same color
                while (row + matchLength < ROWS && 
                       col - matchLength >= 0 && 
                       boardState[row + matchLength][col - matchLength] === currentColor) {
                    matchLength++;
                }
                
                // If we found 4 or more in a row, add all positions
                if (matchLength >= 4) {
                    matchFound = true;
                    for (let i = 0; i < matchLength; i++) {
                        matches.add(`${row + i},${col - i}`);
                    }
                }
            }
        }
    }
    
    if (matchFound) {
        isAnimating = true;
        
        // Convert matches Set to array of positions
        const matchPositions = Array.from(matches).map(pos => {
            const [row, col] = pos.split(',').map(Number);
            return [row, col];
        });
        
        // Flash and update scores
        matchPositions.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            const color = boardState[row][col];
            cell.classList.add('flash');
            
            // Update scores based on the color
            if (color.toLowerCase() === 'blue') scores.blue++;
            if (color.toLowerCase() === 'green') scores.green++;
        });
        
        updateScores(elements);

        // Clear matches after flash animation
        setTimeout(() => {
            matchPositions.forEach(([row, col]) => {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                boardState[row][col] = null;
                cell.className = '';
            });
            
            // Apply gravity after clearing matches
            setTimeout(() => {
                applyGravity(elements);
            }, 50);
        }, 750);
    } else {
        isAnimating = false;
    }
    
    return matchFound;
}

function updateScores(elements) {
    elements.blueScoreDisplay.textContent = scores['blue'];
    elements.greenScoreDisplay.textContent = scores['green'];
}

function declareWinner(elements) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'winner-modal';
    
    // Determine winner and set appropriate class
    let winnerName;
    if (scores.blue > scores.green) {
        winnerName = player1Name;
        modal.classList.add('blue-wins');
    } else if (scores.green > scores.blue) {
        winnerName = player2Name;
        modal.classList.add('green-wins');
    }
    
    // Set modal content
    modal.innerHTML = `
        <h2>${winnerName ? 'Winner!' : 'Game Over!'}</h2>
        <p>${winnerName ? `${winnerName} wins with a score of ${Math.max(scores.blue, scores.green)}!` : 'It\'s a tie!'}</p>
        <p>Blue: ${scores.blue} | Green: ${scores.green}</p>
        <div class="modal-buttons">
            <button onclick="closeWinnerModal(this, 'restart')">Play Again</button>
            <button onclick="closeWinnerModal(this, 'exit')">Exit to Menu</button>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
}

// Update close modal function to handle both restart and exit
window.closeWinnerModal = function(button, action) {
    const modal = button.closest('.winner-modal');
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.remove();
        if (action === 'restart') {
            restartGame(document.querySelectorAll('[id]'));
        } else if (action === 'exit') {
            // Show start screen and hide game screen
            document.getElementById('start-screen').classList.remove('hidden');
            document.getElementById('game').classList.add('hidden');
            // Reset the game state
            restartGame(document.querySelectorAll('[id]'));
        }
    }, 500);
};

function switchPlayer(elements) {
    currentPlayer = currentPlayer === player1Name ? player2Name : player1Name;
    updateCurrentPlayerDisplay(elements);
    
    if (totalTurns !== 999) {
        totalTurns = Math.max(0, totalTurns - 1);
        updateTurns(elements);
        
        if (totalTurns === 0) {
            setTimeout(() => {
                declareWinner(elements);
                restartGame(elements);
            }, 500);
            return;
        }
    }
    
    // Handle AI moves with proper delay
    if ((isAIMode && currentPlayer === player2Name) || 
        (isAIvsAI && (currentPlayer === 'AI 1' || currentPlayer === 'AI 2'))) {
        setTimeout(() => {
            if (!isAnimating) {
                makeAIMove(elements);
            } else {
                // If still animating, try again after a short delay
                setTimeout(() => makeAIMove(elements), 500);
            }
        }, 1000);
    }
}

function isBoardFull(elements) {
    return boardState.every(row => row.every(cell => cell !== null));
}

function checkForEndGame(elements) {
    if (isBoardFull(elements)) {
        declareWinner(elements);
        restartGame(elements);
    }
}

function restartGame(elements) {
    if (lastDropPosition) {
        const lastCell = document.querySelector(`[data-row="${lastDropPosition.row}"][data-col="${lastDropPosition.col}"]`);
        if (lastCell) {
            lastCell.classList.remove('last-drop');
        }
    }
    lastDropPosition = null;
    
    boardState.forEach(row => row.fill(null));
    scores = { blue: 0, green: 0 };
    updateBoard(elements);
    currentPlayer = player1Name;
    updateCurrentPlayerDisplay(elements);
    const selectedRounds = document.getElementById('rounds').value;
    if (selectedRounds === 'unlimited') {
        totalTurns = 999;
        document.querySelectorAll('.turns-left').forEach(el => el.style.display = 'none');
    } else {
        totalTurns = parseInt(selectedRounds) * 2;
        document.querySelectorAll('.turns-left').forEach(el => el.style.display = 'block');
    }
    updateTurns(elements);
    updateScores(elements);
}

function saveGameState(elements) {
    const gameState = {
        boardState,
        scores,
        currentPlayer,
        totalTurns,
    };
    localStorage.setItem('gravityGridSave', JSON.stringify(gameState));
    alert('Game saved!');
}

function loadGameState(elements) {
    const savedState = localStorage.getItem('gravityGridSave');
    if (savedState) {
        const { boardState: savedBoardState, scores: savedScores, currentPlayer: savedCurrentPlayer, totalTurns: savedTotalTurns } = JSON.parse(savedState);
        boardState = savedBoardState;
        scores = savedScores;
        currentPlayer = savedCurrentPlayer;
        totalTurns = savedTotalTurns;
        updateBoard(elements);
        updateScores(elements);
        updateCurrentPlayerDisplay(elements);
        alert('Game loaded!');
    } else {
        alert('No saved game found.');
    }
}

function makeAIMove(elements) {
    if ((!isAIMode && !isAIvsAI) || isAnimating) {
        return;
    }

    // Check if it's an AI's turn
    const isAITurn = (isAIMode && currentPlayer === player2Name) || 
                    (isAIvsAI && (currentPlayer === 'AI 1' || currentPlayer === 'AI 2'));
    
    if (!isAITurn) {
        return;
    }

    console.log('AI making move...');
    let currentAIDifficulty;
    
    if (isAIvsAI) {
        currentAIDifficulty = currentPlayer === 'AI 1' ? ai1Difficulty : ai2Difficulty;
    } else {
        currentAIDifficulty = ai2Difficulty;
    }
    
    console.log('Using AI difficulty:', currentAIDifficulty);
    let col = calculateAIMove(elements, currentAIDifficulty);
    
    // Ensure we have a valid move
    if (col === null || !isValidMove(col)) {
        console.log('AI trying fallback move');
        const validColumns = [];
        for (let i = 0; i < COLS; i++) {
            if (isValidMove(i)) validColumns.push(i);
        }
        if (validColumns.length > 0) {
            col = validColumns[Math.floor(Math.random() * validColumns.length)];
        }
    }

    // Make the move if we have a valid column
    if (col !== null && isValidMove(col)) {
        console.log('AI moving to column:', col);
        dropDisc(col, elements);
    }
}

function calculateAIMove(elements, difficulty = 'medium') {
    // Map the difficulty to the internal values
    switch(difficulty) {
        case 'easy': // Baby
            return calculateEasyAIMove(elements);
        case 'medium': // Adolescent
            return calculateMediumAIMove(elements);
        case 'hard': // Einstein
            return calculateHardAIMove(elements);
        default:
            return calculateMediumAIMove(elements);
    }
}

function calculateEasyAIMove(elements) {
    // Baby AI: 70% chance to make a random move
    if (Math.random() < 0.7) {
        const validColumns = [];
        for (let col = 0; col < COLS; col++) {
            if (!boardState[0][col]) validColumns.push(col);
        }
        return validColumns[Math.floor(Math.random() * validColumns.length)];
    }
    
    // 30% chance to make a slightly better move
    let bestCol = 3;
    let bestScore = -Infinity;
    
    for (let col = 0; col < COLS; col++) {
        const row = getLowestEmptyRow(col);
        if (row === -1) continue;
        
        let score = 0;
        
        // Slightly prefer center columns
        score += (7 - Math.abs(3 - col));
        
        // Check for immediate wins
        boardState[row][col] = 'green';
        if (checkWinningMove(row, col, 'green')) {
            score += 100;
        }
        boardState[row][col] = null;
        
        if (score > bestScore) {
            bestScore = score;
            bestCol = col;
        }
    }
    
    return bestCol;
}

function calculateMediumAIMove(elements) {
    // Adolescent AI: Checks for immediate wins and blocks
    // Check for winning move
    for (let col = 0; col < COLS; col++) {
        const row = getLowestEmptyRow(col);
        if (row !== -1) {
            boardState[row][col] = 'green';
            if (checkWinningMove(row, col, 'green')) {
                boardState[row][col] = null;
                return col;
            }
            boardState[row][col] = null;
        }
    }

    // Block opponent's winning move
    for (let col = 0; col < COLS; col++) {
        const row = getLowestEmptyRow(col);
        if (row !== -1) {
            boardState[row][col] = 'blue';
            if (checkWinningMove(row, col, 'blue')) {
                boardState[row][col] = null;
                return col;
            }
            boardState[row][col] = null;
        }
    }

    // Simple scoring system for adolescent difficulty
    let bestScore = -Infinity;
    let bestCol = 3;
    
    for (let col = 0; col < COLS; col++) {
        const row = getLowestEmptyRow(col);
        if (row === -1) continue;
        
        let score = 0;
        
        // Prefer center columns
        score += (7 - Math.abs(3 - col)) * 2;
        
        // Check for potential threats
        boardState[row][col] = 'green';
        score += countThreats('green') * 5;
        boardState[row][col] = null;
        
        if (score > bestScore) {
            bestScore = score;
            bestCol = col;
        }
    }
    
    return bestCol;
}

function calculateHardAIMove(elements) {
    // Einstein AI: Advanced strategy with multiple levels of analysis
    // First check for immediate win
    for (let col = 0; col < COLS; col++) {
        const row = getLowestEmptyRow(col);
        if (row !== -1) {
            boardState[row][col] = 'green';
            if (checkWinningMove(row, col, 'green')) {
                boardState[row][col] = null;
                return col;
            }
            boardState[row][col] = null;
        }
    }

    // Then check for opponent's immediate win to block
    for (let col = 0; col < COLS; col++) {
        const row = getLowestEmptyRow(col);
        if (row !== -1) {
            boardState[row][col] = 'blue';
            if (checkWinningMove(row, col, 'blue')) {
                boardState[row][col] = null;
                return col;
            }
            boardState[row][col] = null;
        }
    }

    // Evaluate each possible move with a complex scoring system
    let bestScore = -Infinity;
    let bestCol = 3;
    
    for (let col = 0; col < COLS; col++) {
        const row = getLowestEmptyRow(col);
        if (row === -1) continue;
        
        let score = 0;
        
        // Try the move
        boardState[row][col] = 'green';
        
        // Score based on number of threats created
        score += countThreats('green') * 10;
        
        // Score based on preventing opponent threats
        boardState[row][col] = 'blue';
        score += countThreats('blue') * 8;
        
        // Score based on position (center columns are better)
        score += (7 - Math.abs(3 - col)) * 3;
        
        // Score based on vertical stacking potential
        if (row < ROWS - 1 && boardState[row + 1][col]) {
            score += 2;
        }
        
        // Check if this move enables a winning move for opponent on top
        if (row > 0) {
            boardState[row - 1][col] = 'blue';
            if (checkWinningMove(row - 1, col, 'blue')) {
                score -= 15;
            }
            boardState[row - 1][col] = null;
        }
        
        // Check for double threat creation (two winning possibilities)
        boardState[row][col] = 'green';
        const threats = countThreats('green');
        if (threats >= 2) {
            score += 20;
        }
        
        // Check for potential trap setups
        for (let trapCol = 0; trapCol < COLS; trapCol++) {
            if (trapCol === col) continue;
            const trapRow = getLowestEmptyRow(trapCol);
            if (trapRow !== -1) {
                boardState[trapRow][trapCol] = 'green';
                if (countThreats('green') >= 2) {
                    score += 15;
                }
                boardState[trapRow][trapCol] = null;
            }
        }
        
        // Reset the cell
        boardState[row][col] = null;
        
        // Update best move if this score is higher
        if (score > bestScore) {
            bestScore = score;
            bestCol = col;
        }
    }
    
    return bestCol;
}

function getLowestEmptyRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!boardState[row][col]) return row;
    }
    return -1;
}

function checkWinningMove(row, col, player) {
    const directions = [
        { x: 1, y: 0 },  // Horizontal
        { x: 0, y: 1 },  // Vertical
        { x: 1, y: 1 },  // Diagonal down-right
        { x: 1, y: -1 }  // Diagonal up-right
    ];

    for (const direction of directions) {
        let count = 1;
        
        // Check forward
        for (let i = 1; i < 4; i++) {
            const newRow = row + direction.y * i;
            const newCol = col + direction.x * i;
            if (
                newRow < 0 || newRow >= ROWS ||
                newCol < 0 || newCol >= COLS ||
                boardState[newRow][newCol] !== player
            ) break;
            count++;
        }
        
        // Check backward
        for (let i = 1; i < 4; i++) {
            const newRow = row - direction.y * i;
            const newCol = col - direction.x * i;
            if (
                newRow < 0 || newRow >= ROWS ||
                newCol < 0 || newCol >= COLS ||
                boardState[newRow][newCol] !== player
            ) break;
            count++;
        }

        if (count >= 4) return true;
    }
    return false;
}

function countThreats(player) {
    let threats = 0;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (!boardState[row][col]) {
                boardState[row][col] = player;
                if (checkWinningMove(row, col, player)) threats++;
                boardState[row][col] = null;
            }
        }
    }
    return threats;
}

function applyGravity(elements) {
    let piecesFell = false;
    
    // Process columns from bottom to top
    for (let col = 0; col < COLS; col++) {
        // Collect non-null pieces in the column
        let pieces = [];
        for (let row = ROWS - 1; row >= 0; row--) {
            if (boardState[row][col]) {
                pieces.push(boardState[row][col]);
                boardState[row][col] = null;
            }
        }
        
        // Place pieces back from bottom up
        let currentRow = ROWS - 1;
        while (pieces.length > 0 && currentRow >= 0) {
            boardState[currentRow][col] = pieces.shift();
            currentRow--;
        }
    }
    
    // Update the visual board
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.className = boardState[row][col] ? boardState[row][col].toLowerCase() : '';
            }
        }
    }
    
    // Check for new matches after a brief delay
    setTimeout(() => {
        checkForMatches(elements);
    }, 300);
}

// Add CSS for falling animation if not already present
const style = document.createElement('style');
style.textContent = `
.falling {
    animation: fall 0.3s ease-in;
}

@keyframes fall {
    0% {
        transform: translateY(-100%);
        opacity: 0;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}`;
document.head.appendChild(style);

