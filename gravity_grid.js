// Gravity Grid Game Logic

// Initialize game variables
const ROWS = 6;
const COLS = 7;
const boardState = Array.from({ length: 6 }, () => Array(7).fill(null));
let currentPlayer = 'Blue';
let scores = { blue: 0, green: 0 };
let totalTurns = 40;
let player1Name = 'Blue';
let player2Name = 'Green';

// Audio elements
const backgroundMusic = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
let isMusicPlaying = false;

// Initialize audio
backgroundMusic.volume = 0.225; // Set volume to 22.5% (reduced by 25% from 30%)

// Music toggle functionality
musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        musicToggle.textContent = '🔇';
        musicToggle.classList.add('muted');
    } else {
        backgroundMusic.play();
        musicToggle.textContent = '🔊';
        musicToggle.classList.remove('muted');
    }
    isMusicPlaying = !isMusicPlaying;
});

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const currentPlayerDisplay = document.getElementById('current-player');
    const blueScoreDisplay = document.getElementById('blue-score');
    const greenScoreDisplay = document.getElementById('green-score');
    const restartButton = document.getElementById('restart');
    const startButton = document.getElementById('start-button');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game');
    const blueTurnsDisplay = document.getElementById('blue-turns');
    const greenTurnsDisplay = document.getElementById('green-turns');
    const saveButton = document.getElementById('save-button');
    const loadButton = document.getElementById('load-button');

    function updateTurns() {
        const turnsPerPlayer = totalTurns / 2;
        const blueTurns = currentPlayer === player1Name ? Math.ceil(turnsPerPlayer) : Math.floor(turnsPerPlayer);
        const greenTurns = currentPlayer === player2Name ? Math.ceil(turnsPerPlayer) : Math.floor(turnsPerPlayer);
        blueTurnsDisplay.textContent = blueTurns;
        greenTurnsDisplay.textContent = greenTurns;
    }

    function updateCurrentPlayerDisplay() {
        currentPlayerDisplay.textContent = currentPlayer;
        currentPlayerDisplay.style.color = currentPlayer === player1Name ? '#1E90FF' : '#32CD32';
    }

    startButton.addEventListener('click', () => {
        player1Name = document.getElementById('player1-name').value || 'Blue';
        player2Name = document.getElementById('player2-name').value || 'Green';
        document.getElementById('blue-info').querySelector('span').textContent = player1Name;
        document.getElementById('green-info').querySelector('span').textContent = player2Name;

        document.getElementById('blue-info').querySelector('span').style.fontWeight = 'bold';
        document.getElementById('green-info').querySelector('span').style.fontWeight = 'bold';
        document.getElementById('blue-info').querySelector('span').style.fontSize = '1.2em';
        document.getElementById('green-info').querySelector('span').style.fontSize = '1.2em';

        // Start the background music
        backgroundMusic.play().catch(error => {
            console.log('Auto-play was prevented. Please click the music button to start the music.');
        });
        musicToggle.textContent = '🔊';
        musicToggle.classList.remove('muted');
        isMusicPlaying = true;

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
        updateTurns();
        updateCurrentPlayerDisplay();
        createBoard();
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
    });

    function createBoard() {
        board.innerHTML = '';
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement('div');
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => dropDisc(col));
                board.appendChild(cell);
            }
        }
    }

    function dropDisc(col) {
        for (let row = 5; row >= 0; row--) {
            if (!boardState[row][col]) {
                const color = currentPlayer === player1Name ? 'blue' : 'green';
                boardState[row][col] = color;
                
                // Play drop sound
                const dropSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
                dropSound.volume = 0.5;
                dropSound.play();
                
                // Force immediate update of the cell's class
                const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cellElement.className = color;
                
                updateBoard();
                checkForMatches();
                switchPlayer();
                checkForEndGame();
                break;
            }
        }
    }

    function updateBoard() {
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

    function cascadeTiles() {
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
                        updateBoard();
                    }, 500);
                }
            }
        }
    }

    function checkForMatches() {
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
            // Play match sound
            const matchSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
            matchSound.volume = 0.7;
            matchSound.play();
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
            cascadeTiles();
            updateBoard();
            setTimeout(checkForMatches, 500);
            updateScores();
        }
    }

    function updateScores() {
        document.getElementById('blue-score').textContent = scores['blue'];
        document.getElementById('green-score').textContent = scores['green'];
    }

    function declareWinner() {
        // Play win sound
        const winSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        winSound.volume = 0.8;
        winSound.play();
        
        if (scores.blue > scores.green) {
            alert(`Game Over! ${player1Name} wins!`);
        } else if (scores.green > scores.blue) {
            alert(`Game Over! ${player2Name} wins!`);
        } else {
            alert('Game Over! It\'s a tie!');
        }
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === player1Name ? player2Name : player1Name;
        updateCurrentPlayerDisplay();
        if (totalTurns !== 999) {
            totalTurns--;
            updateTurns();
        }
        if (totalTurns <= 0) {
            declareWinner();
            restartGame();
        }
    }

    function isBoardFull() {
        return boardState.every(row => row.every(cell => cell !== null));
    }

    function checkForEndGame() {
        if (isBoardFull()) {
            declareWinner();
            restartGame();
        }
    }

    restartButton.addEventListener('click', restartGame);

    function restartGame() {
        boardState.forEach(row => row.fill(null));
        scores = { blue: 0, green: 0 };
        updateBoard();
        currentPlayer = player1Name;
        updateCurrentPlayerDisplay();
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
        updateTurns();
        updateScores();
    }

    function saveGameState() {
        const gameState = {
            boardState,
            scores,
            currentPlayer,
            totalTurns,
        };
        localStorage.setItem('gravityGridSave', JSON.stringify(gameState));
        alert('Game saved!');
    }

    function loadGameState() {
        const savedState = localStorage.getItem('gravityGridSave');
        if (savedState) {
            const { boardState: savedBoardState, scores: savedScores, currentPlayer: savedCurrentPlayer, totalTurns: savedTotalTurns } = JSON.parse(savedState);
            boardState = savedBoardState;
            scores = savedScores;
            currentPlayer = savedCurrentPlayer;
            totalTurns = savedTotalTurns;
            updateBoard();
            updateScores();
            updateCurrentPlayerDisplay();
            alert('Game loaded!');
        } else {
            alert('No saved game found.');
        }
    }

    saveButton.addEventListener('click', saveGameState);
    loadButton.addEventListener('click', loadGameState);

    updateCurrentPlayerDisplay();

    createBoard();
});
