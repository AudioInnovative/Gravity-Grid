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
let aiDifficulty = 'medium';
let isAITurn = false;
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

    // Add game mode change handler
    if (elements.gameModeSelect) {
        elements.gameModeSelect.addEventListener('change', (e) => {
            isAIMode = e.target.value === 'ai';
            console.log('Game mode changed to:', isAIMode ? 'AI' : 'Human');
            
            if (elements.aiOptions) {
                elements.aiOptions.classList.toggle('hidden', !isAIMode);
            }
            
            const player2Container = document.querySelector('.player-input:nth-child(2)');
            if (player2Container) {
                player2Container.classList.toggle('hidden', isAIMode);
                if (isAIMode) {
                    player2Name = 'AI';
                    const player2Input = document.getElementById('player2-name');
                    if (player2Input) {
                        player2Input.value = 'AI';
                    }
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
    const turnsPerPlayer = totalTurns / 2;
    const blueTurns = currentPlayer === player1Name ? Math.ceil(turnsPerPlayer) : Math.floor(turnsPerPlayer);
    const greenTurns = currentPlayer === player2Name ? Math.ceil(turnsPerPlayer) : Math.floor(turnsPerPlayer);
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
    const aiDifficultySelect = document.getElementById('ai-difficulty');
    const roundsSelect = document.getElementById('rounds');
    const backgroundMusic = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');

    player1Name = player1Input ? player1Input.value || 'Blue' : 'Blue';
    isAIMode = gameModeSelect ? gameModeSelect.value === 'ai' : false;

    if (isAIMode) {
        player2Name = 'AI';
        aiDifficulty = aiDifficultySelect ? aiDifficultySelect.value : 'medium';
        console.log('Starting game in AI mode with difficulty:', aiDifficulty);
    } else {
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
    if (!isValidMove(col)) return;
    
    for (let row = 5; row >= 0; row--) {
        if (!boardState[row][col]) {
            const color = currentPlayer === player1Name ? 'blue' : 'green';
            boardState[row][col] = color;
            
            // Force immediate update of the cell's class
            const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cellElement.className = color;
            
            updateBoard(elements);
            checkForMatches(elements);
            switchPlayer(elements);
            checkForEndGame(elements);
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
    boardState.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`);
            if (cell) {
                cellElement.className = cell;
            } else {
                cellElement.className = '';
            }
        });
    });
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
    const directions = [
        { x: 1, y: 0 },  // Horizontal
        { x: 0, y: 1 },  // Vertical
        { x: 1, y: 1 },  // Diagonal down-right
        { x: 1, y: -1 }  // Diagonal up-right
    ];

    function checkDirection(row, col, direction) {
        const player = boardState[row][col];
        if (!player) return false;

        for (let i = 1; i < 4; i++) {
            const newRow = row + direction.y * i;
            const newCol = col + direction.x * i;

            if (
                newRow < 0 || newRow >= 6 ||
                newCol < 0 || newCol >= 7 ||
                boardState[newRow][newCol] !== player
            ) {
                return false;
            }
        }
        return true;
    }

    function clearDirection(row, col, direction) {
        const player = boardState[row][col];
        for (let i = 0; i < 4; i++) {
            const newRow = row + direction.y * i;
            const newCol = col + direction.x * i;
            boardState[newRow][newCol] = null;
        }
        // Update score based on the color
        scores[player] += 4;
    }

    let anyCleared = false;

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            directions.forEach(direction => {
                if (checkDirection(row, col, direction)) {
                    clearDirection(row, col, direction);
                    anyCleared = true;
                }
            });
        }
    }

    if (anyCleared) {
        cascadeTiles(elements);
        updateBoard(elements);
        setTimeout(checkForMatches, 500, elements);
        updateScores(elements);
    }
}

function updateScores(elements) {
    elements.blueScoreDisplay.textContent = scores['blue'];
    elements.greenScoreDisplay.textContent = scores['green'];
}

function declareWinner(elements) {
    if (scores.blue > scores.green) {
        alert(`Game Over! ${player1Name} wins!`);
    } else if (scores.green > scores.blue) {
        alert(`Game Over! ${player2Name} wins!`);
    } else {
        alert('Game Over! It\'s a tie!');
    }
}

function switchPlayer(elements) {
    currentPlayer = currentPlayer === player1Name ? player2Name : player1Name;
    updateCurrentPlayerDisplay(elements);
    
    if (totalTurns !== 999) {
        totalTurns--;
        updateTurns(elements);
    }
    
    // Handle AI turn
    if (isAIMode && currentPlayer === player2Name) {
        console.log('AI turn starting');
        isAITurn = true;
        // Add a small delay before AI move
        setTimeout(() => {
            if (isAITurn && currentPlayer === player2Name) {
                makeAIMove(elements);
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
    boardState.forEach(row => row.fill(null));
    scores = { blue: 0, green: 0 };
    updateBoard(elements);
    currentPlayer = player1Name;
    updateCurrentPlayerDisplay(elements);
    const selectedRounds = document.getElementById('rounds').value;
    if (selectedRounds === 'unlimited') {
        totalTurns = 999;
        // Hide turn counters in unlimited mode
        document.querySelectorAll('.turns-left').forEach(el => el.style.display = 'none');
    } else {
        totalTurns = parseInt(selectedRounds) * 2;
        // Show turn counters in regular mode
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
    if (!isAITurn || currentPlayer !== player2Name) {
        console.log('Not AI turn or not AI player');
        return;
    }

    console.log('AI making move...');
    let col = calculateAIMove(elements);
    
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
        isAITurn = false;
        dropDisc(col, elements);
    } else {
        console.log('AI could not find a valid move');
    }
}

function calculateAIMove(elements) {
    switch(aiDifficulty) {
        case 'easy':
            return calculateEasyAIMove(elements);
        case 'medium':
            return calculateMediumAIMove(elements);
        case 'hard':
            return calculateHardAIMove(elements);
        default:
            return calculateMediumAIMove(elements);
    }
}

function calculateEasyAIMove(elements) {
    // Random valid move
    const validColumns = [];
    for (let col = 0; col < COLS; col++) {
        if (!boardState[0][col]) validColumns.push(col);
    }
    return validColumns[Math.floor(Math.random() * validColumns.length)];
}

function calculateMediumAIMove(elements) {
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

    // Try to create a potential winning move
    for (let col = 0; col < COLS; col++) {
        const row = getLowestEmptyRow(col);
        if (row !== -1) {
            // Check if this move creates a potential winning situation
            boardState[row][col] = 'green';
            let threats = countThreats('green');
            boardState[row][col] = null;
            
            if (threats > 0) {
                return col;
            }
        }
    }

    // If no strategic move found, prefer center columns
    const centerPriority = [3, 2, 4, 1, 5, 0, 6];
    for (const col of centerPriority) {
        if (getLowestEmptyRow(col) !== -1) return col;
    }

    // Fallback to random move
    return calculateEasyAIMove(elements);
}

function calculateHardAIMove(elements) {
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

    // Look for moves that create multiple threats
    let bestCol = null;
    let maxThreats = -1;

    for (let col = 0; col < COLS; col++) {
        const row = getLowestEmptyRow(col);
        if (row !== -1) {
            boardState[row][col] = 'green';
            const threats = countThreats('green');
            boardState[row][col] = null;

            if (threats > maxThreats) {
                maxThreats = threats;
                bestCol = col;
            }
        }
    }

    if (bestCol !== null) {
        return bestCol;
    }

    // If no good strategic move, use medium strategy
    return calculateMediumAIMove(elements);
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

