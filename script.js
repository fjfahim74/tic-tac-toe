// Game State
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameMode = 0; // 0: Two Player, 1: Easy, 2: Medium, 3: Hard
let gameActive = true;
let isVsComputer = false;
let player1Name = 'Player 1';
let player2Name = 'Player 2';
let pendingGameMode = null;
let currentMode = 'age-selection'; // 'age-selection', 'adult', 'kids'

// Adult Profile System
let adultProfile = {
    name: '',
    hasProfile: false
};

// Kids mode game state
let kidsBoard = ['', '', '', '', '', '', '', '', ''];
let kidsCurrentPlayer = 'X';
let kidsGameMode = 0;
let kidsGameActive = true;
let kidsIsVsComputer = false;
let kidsPlayer1Name = 'Player 1';
let kidsPlayer2Name = 'Robot';
let kidsPendingGameMode = null;

// Kids Statistics
let kidsStats = {
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    starsCollected: 0
};

// Kids Achievements
let kidsAchievements = {
    'first-win': false,
    'super-star': false,
    'robot-master': false,
    'game-lover': false
};

// Statistics
let stats = {
    totalGames: 0,
    playerWins: 0,
    computerWins: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0
};

// Achievements
let achievements = {
    'first-win': false,
    'five-wins': false,
    'ten-wins': false,
    'beat-hard': false,
    'win-streak': false,
    'champion': false
};

// Game history
let gameHistory = [];

// Settings
let settings = {
    sound: true,
    animations: true,
    confetti: true,
    theme: 'default' // default, winter, summer, spring, autumn
};

// Load stats from localStorage
function loadStats() {
    const savedStats = localStorage.getItem('tictactoe_stats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
        // Ensure new properties exist
        if (stats.currentStreak === undefined) stats.currentStreak = 0;
        if (stats.bestStreak === undefined) stats.bestStreak = 0;
    }
    const savedHistory = localStorage.getItem('tictactoe_history');
    if (savedHistory) {
        gameHistory = JSON.parse(savedHistory);
    }
    const savedSettings = localStorage.getItem('tictactoe_settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }
    const savedAchievements = localStorage.getItem('tictactoe_achievements');
    if (savedAchievements) {
        achievements = JSON.parse(savedAchievements);
    }

    // Load kids stats
    const savedKidsStats = localStorage.getItem('tictactoe_kids_stats');
    if (savedKidsStats) {
        kidsStats = JSON.parse(savedKidsStats);
    }
    const savedKidsAchievements = localStorage.getItem('tictactoe_kids_achievements');
    if (savedKidsAchievements) {
        kidsAchievements = JSON.parse(savedKidsAchievements);
    }
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('tictactoe_stats', JSON.stringify(stats));
}

function saveHistory() {
    localStorage.setItem('tictactoe_history', JSON.stringify(gameHistory));
}

function saveSettings() {
    localStorage.setItem('tictactoe_settings', JSON.stringify(settings));
}

function saveAchievements() {
    localStorage.setItem('tictactoe_achievements', JSON.stringify(achievements));
}

function saveKidsStats() {
    localStorage.setItem('tictactoe_kids_stats', JSON.stringify(kidsStats));
}

function saveKidsAchievements() {
    localStorage.setItem('tictactoe_kids_achievements', JSON.stringify(kidsAchievements));
}

// Adult Profile Functions
function loadProfile() {
    const savedProfile = localStorage.getItem('tictactoe_adult_profile');
    if (savedProfile) {
        adultProfile = JSON.parse(savedProfile);
    }
}

function saveProfile() {
    const nameInput = document.getElementById('profileName');
    const name = nameInput.value.trim();

    if (!name) {
        alert('Please enter your name! 😊');
        nameInput.focus();
        return;
    }

    playSound('click');
    adultProfile.name = name;
    adultProfile.hasProfile = true;
    localStorage.setItem('tictactoe_adult_profile', JSON.stringify(adultProfile));

    updateProfileDisplay();
    showScreen('mainMenu');
}

function editProfile() {
    playSound('click');
    const newName = prompt('Enter your new name:', adultProfile.name);

    if (newName && newName.trim()) {
        adultProfile.name = newName.trim();
        localStorage.setItem('tictactoe_adult_profile', JSON.stringify(adultProfile));
        updateProfileDisplay();
    }
}

function updateProfileDisplay() {
    const displayElement = document.getElementById('profileDisplayName');
    if (displayElement && adultProfile.name) {
        displayElement.textContent = adultProfile.name;
    }
}

// Winning combinations
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    loadStats();
    // Don't load profile - require fresh login each time
    // loadProfile();
    updateStatsDisplay();
    applySettings();
    applyTheme(); // Apply saved theme

    // Add typing sound to all input fields
    const inputFields = document.querySelectorAll('input[type="text"]');
    inputFields.forEach(input => {
        input.addEventListener('input', () => {
            playSound('type');
        });
    });

    // Initialize audio context on first user interaction
    const enableAudio = () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
    };
    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
});

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Show Name Input Screen
function showNameInput(mode) {
    playSound('click');
    pendingGameMode = mode;

    if (mode === 'ai') {
        // If playing vs computer, use profile name and skip to difficulty
        player1Name = adultProfile.name || 'Player 1';
        player2Name = 'AI';
        isVsComputer = true;
        showScreen('difficultyScreen');
    } else {
        // If playing vs friend, only ask for friend's name
        const player2Group = document.getElementById('player2Group');
        const player1Group = document.querySelector('.input-group:first-child');
        const player1Label = document.querySelector('label[for="player1Name"]');
        const player1Input = document.getElementById('player1Name');

        // Hide player 1 input since we're using profile
        if (player1Group) {
            player1Group.style.display = 'none';
        }

        // Show player 2 input
        player2Group.style.display = 'block';

        // Update label for clarity
        const player2Label = document.querySelector('label[for="player2Name"]');
        if (player2Label) {
            player2Label.textContent = "Friend's Name (O)";
        }
        document.getElementById('player2Name').placeholder = "Enter friend's name";

        // Clear player 2 input
        document.getElementById('player2Name').value = '';

        showScreen('nameInputScreen');
    }
}

// Proceed from Name Input
function proceedFromNameInput() {
    playSound('click');

    // Use profile name for player 1
    player1Name = adultProfile.name || 'Player 1';

    if (pendingGameMode === 'ai') {
        player2Name = 'AI';
        isVsComputer = true;
        showScreen('difficultyScreen');
    } else {
        player2Name = document.getElementById('player2Name').value.trim() || 'Player 2';
        isVsComputer = false;
        startGameWithDifficulty(0);
    }
}

// Back to Name Input
function backToNameInput() {
    playSound('click');
    // If playing vs AI, go back to main menu (skip name input)
    if (pendingGameMode === 'ai') {
        showScreen('mainMenu');
    } else {
        showScreen('nameInputScreen');
    }
}

// Start Game with Difficulty
function startGameWithDifficulty(difficulty) {
    // Stop background music immediately
    stopBackgroundMusic();

    // Play game start sound after brief moment for clean transition
    setTimeout(() => playSound('gameStart'), 50);

    gameMode = difficulty;

    const difficultyNames = ['Two Player Mode', 'Easy AI', 'Medium AI', 'Hard AI'];
    document.getElementById('gameMode').textContent = difficultyNames[difficulty];

    // Update player badges
    document.getElementById('playerXBadge').textContent = player1Name;
    document.getElementById('playerOBadge').textContent = player2Name;

    resetBoard();
    showScreen('gameScreen');
    updateTurnIndicator();
}

// Start Game (kept for compatibility)
function startGame(mode) {
    gameMode = mode;
    isVsComputer = mode > 0;

    const modeNames = ['Two Player Mode', 'vs AI (Easy)', 'vs AI (Medium)', 'vs AI (Hard)'];
    document.getElementById('gameMode').textContent = modeNames[mode];

    resetBoard();
    showScreen('gameScreen');
    updateTurnIndicator();
}

// Reset Board
function resetBoard() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'taken', 'winning');
    });
}

// Handle Cell Click
function handleCellClick(index) {
    if (!gameActive || board[index] !== '' || (isVsComputer && currentPlayer === 'O')) {
        // Add shake animation for invalid moves
        if (board[index] !== '') {
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            cell.classList.add('invalid-move');
            setTimeout(() => cell.classList.remove('invalid-move'), 500);
            playSound('invalid');
        }
        return;
    }

    makeMove(index, currentPlayer);
}

// Make Move
function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase(), 'taken');
    playSound('move');

    if (checkWinner(player)) {
        endGame(player);
        return;
    }

    if (checkDraw()) {
        endGame('draw');
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();

    if (isVsComputer && currentPlayer === 'O') {
        setTimeout(makeComputerMove, 600);
    }
}

// Update Turn Indicator
function updateTurnIndicator() {
    const indicator = document.getElementById('turnIndicator');
    if (isVsComputer) {
        indicator.textContent = currentPlayer === 'X' ? `${player1Name}'s Turn` : 'AI is thinking...';
        if (currentPlayer === 'X') {
            indicator.style.setProperty('background', 'rgba(15, 23, 42, 0.6)', 'important');
            indicator.style.setProperty('border-color', '#0dcaf0', 'important');
            indicator.style.setProperty('color', '#0dcaf0', 'important');
            indicator.style.setProperty('box-shadow', '0 0 25px rgba(13, 202, 240, 0.4), inset 0 0 20px rgba(13, 202, 240, 0.1)', 'important');
        } else {
            indicator.style.setProperty('background', 'rgba(15, 23, 42, 0.6)', 'important');
            indicator.style.setProperty('border-color', '#a78bfa', 'important');
            indicator.style.setProperty('color', '#a78bfa', 'important');
            indicator.style.setProperty('box-shadow', '0 0 25px rgba(167, 139, 250, 0.4), inset 0 0 20px rgba(167, 139, 250, 0.1)', 'important');
        }
    } else {
        const playerName = currentPlayer === 'X' ? player1Name : player2Name;
        indicator.textContent = `${playerName}'s Turn`;
        if (currentPlayer === 'X') {
            indicator.style.setProperty('background', 'rgba(15, 23, 42, 0.6)', 'important');
            indicator.style.setProperty('border-color', '#0dcaf0', 'important');
            indicator.style.setProperty('color', '#0dcaf0', 'important');
            indicator.style.setProperty('box-shadow', '0 0 25px rgba(13, 202, 240, 0.4), inset 0 0 20px rgba(13, 202, 240, 0.1)', 'important');
        } else {
            indicator.style.setProperty('background', 'rgba(15, 23, 42, 0.6)', 'important');
            indicator.style.setProperty('border-color', '#a78bfa', 'important');
            indicator.style.setProperty('color', '#a78bfa', 'important');
            indicator.style.setProperty('box-shadow', '0 0 25px rgba(167, 139, 250, 0.4), inset 0 0 20px rgba(167, 139, 250, 0.1)', 'important');
        }
    }
}

// Check Winner
function checkWinner(player) {
    for (let combo of winningCombinations) {
        if (combo.every(index => board[index] === player)) {
            highlightWinningCells(combo);
            return true;
        }
    }
    return false;
}

// Highlight Winning Cells
function highlightWinningCells(combo) {
    combo.forEach(index => {
        document.querySelector(`.cell[data-index="${index}"]`).classList.add('winning');
    });
}

// Check Draw
function checkDraw() {
    return board.every(cell => cell !== '');
}

// End Game
function endGame(result) {
    gameActive = false;

    // Add celebration animations to the board
    if (settings.animations) {
        setTimeout(() => {
            document.querySelector('.game-board').style.animation = 'celebrationBounce 0.6s ease-in-out';
        }, 500);
    }

    const modal = document.getElementById('resultModal');
    const title = document.getElementById('resultTitle');
    const message = document.getElementById('resultMessage');

    stats.totalGames++;

    let resultText = '';
    let winnerName = '';

    if (result === 'draw') {
        playSound('draw');
        title.textContent = '🤝 It\'s a Draw!';
        title.style.color = '#f59e0b';
        message.textContent = 'Well played by both sides!';
        stats.draws++;
        resultText = 'Draw';
        winnerName = 'draw';

        // Reset streak on draw
        if (stats.currentStreak !== undefined) {
            stats.currentStreak = 0;
        }
    } else if (result === 'X') {
        playSound('win');
        title.textContent = `🎉 ${player1Name} Wins!`;
        title.style.color = '#10b981';
        message.textContent = isVsComputer ? 'Congratulations! You beat the AI!' : `Congratulations ${player1Name}!`;
        stats.playerWins++;
        resultText = `${player1Name} Won`;
        winnerName = 'X';
        if (settings.confetti) createConfetti();

        // Update streak for player win
        if (stats.currentStreak !== undefined) {
            stats.currentStreak++;
            if (stats.bestStreak !== undefined && stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }
        }

        // Track if beat hard AI
        if (typeof achievements !== 'undefined' && isVsComputer && gameMode === 3 && !achievements['beat-hard']) {
            achievements['beat-hard'] = true;
        }
    } else {
        playSound('win');
        if (isVsComputer) {
            title.textContent = '💻 AI Wins!';
            title.style.color = '#ef4444';
            message.textContent = 'Better luck next time!';
            stats.computerWins++;
            resultText = 'AI Won';

            // Reset streak on loss
            if (stats.currentStreak !== undefined) {
                stats.currentStreak = 0;
            }
        } else {
            title.textContent = `🎉 ${player2Name} Wins!`;
            title.style.color = '#ef4444';
            message.textContent = `Congratulations ${player2Name}!`;
            stats.computerWins++;
            resultText = `${player2Name} Won`;
            if (settings.confetti) createConfetti();

            // Reset streak on loss (vs friend)
            if (stats.currentStreak !== undefined) {
                stats.currentStreak = 0;
            }
        }
        winnerName = 'O';
    }

    addToHistory(resultText, winnerName);
    saveStats();
    updateStatsDisplay();

    setTimeout(() => {
        modal.classList.add('active');

        // Check for achievements after modal is shown (adult mode only)
        if (typeof checkAchievements === 'function') {
            setTimeout(() => {
                try {
                    checkAchievements();
                } catch (e) {
                    console.log('Achievement check error:', e);
                }
            }, 500);
        }
    }, 1000);
}

// Create confetti effect
function createConfetti() {
    const colors = ['#0d6efd', '#dc267f', '#ffc107', '#0dcaf0', '#20c997'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(confetti);

        const duration = Math.random() * 3 + 2;
        const endLeft = parseFloat(confetti.style.left) + (Math.random() - 0.5) * 100;

        confetti.animate([
            {
                transform: `translateY(0) rotate(0deg)`,
                opacity: 1
            },
            {
                transform: `translateY(${window.innerHeight + 10}px) translateX(${endLeft - parseFloat(confetti.style.left)}vw) rotate(${Math.random() * 720}deg)`,
                opacity: 0
            }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        setTimeout(() => confetti.remove(), duration * 1000);
    }
}

// Add celebration bounce animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes celebrationBounce {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.05) rotate(2deg); }
        75% { transform: scale(1.05) rotate(-2deg); }
    }
`;
document.head.appendChild(style);

// Computer Move Logic
function makeComputerMove() {
    if (!gameActive) return;

    let move;
    if (gameMode === 1) {
        move = getRandomMove();
    } else if (gameMode === 2) {
        move = Math.random() < 0.7 ? getBestMove() : getRandomMove();
    } else {
        move = getBestMove();
    }

    if (move !== -1) {
        makeMove(move, 'O');
    }
}

// Get Random Move
function getRandomMove() {
    const availableMoves = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
}

// Get Best Move using Minimax
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

// Minimax Algorithm
function minimax(board, depth, isMaximizing) {
    if (checkWinnerForMinimax('O')) return 10 - depth;
    if (checkWinnerForMinimax('X')) return depth - 10;
    if (checkDraw()) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check Winner for Minimax
function checkWinnerForMinimax(player) {
    return winningCombinations.some(combo =>
        combo.every(index => board[index] === player)
    );
}

// Restart Game
function restartGame() {
    playSound('click');
    document.getElementById('resultModal').classList.remove('active');
    resetBoard();
    updateTurnIndicator();
}

// Back to Menu
function backToMenu() {
    playSound('click');
    document.getElementById('resultModal').classList.remove('active');
    showScreen('mainMenu');

    // Resume background music when returning to menu
    if (settings.sound) {
        musicShouldPlay = true;
        createBackgroundMusic();
    }
}

// Show Statistics
function showStats() {
    playSound('click');
    updateStatsDisplay();
    showScreen('statsScreen');
}

// Show Achievements Screen
function showAchievements() {
    playSound('click');
    updateAchievementsDisplay();
    showScreen('achievementsScreen');
}

// Update Statistics Display
function updateStatsDisplay() {
    // Only update if elements exist (on stats screen)
    const totalGamesEl = document.getElementById('totalGames');
    if (!totalGamesEl) return;

    totalGamesEl.textContent = stats.totalGames;
    document.getElementById('playerWins').textContent = stats.playerWins;
    document.getElementById('computerWins').textContent = stats.computerWins;
    document.getElementById('draws').textContent = stats.draws;

    if (stats.totalGames > 0) {
        document.getElementById('playerWinPercent').textContent =
            Math.round((stats.playerWins / stats.totalGames) * 100) + '%';
        document.getElementById('computerWinPercent').textContent =
            Math.round((stats.computerWins / stats.totalGames) * 100) + '%';
        document.getElementById('drawPercent').textContent =
            Math.round((stats.draws / stats.totalGames) * 100) + '%';
    } else {
        document.getElementById('playerWinPercent').textContent = '0%';
        document.getElementById('computerWinPercent').textContent = '0%';
        document.getElementById('drawPercent').textContent = '0%';
    }

    // Update achievements display
    try {
        updateAchievementsDisplay();
    } catch (e) {
        console.log('Achievement display error:', e);
    }
}

// Achievement Functions
function updateAchievementsDisplay() {
    for (const [key, unlocked] of Object.entries(achievements)) {
        const card = document.querySelector(`.achievement-card[data-achievement="${key}"]`);
        if (card) {
            if (unlocked) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
            } else {
                card.classList.add('locked');
                card.classList.remove('unlocked');
            }
        }
    }
}

function checkAchievements() {
    let newAchievements = [];

    // First Victory
    if (stats.playerWins >= 1 && !achievements['first-win']) {
        achievements['first-win'] = true;
        newAchievements.push({ id: 'first-win', name: 'First Victory', icon: '🥇' });
    }

    // Rising Star (5 wins)
    if (stats.playerWins >= 5 && !achievements['five-wins']) {
        achievements['five-wins'] = true;
        newAchievements.push({ id: 'five-wins', name: 'Rising Star', icon: '⭐' });
    }

    // Skilled Player (10 wins)
    if (stats.playerWins >= 10 && !achievements['ten-wins']) {
        achievements['ten-wins'] = true;
        newAchievements.push({ id: 'ten-wins', name: 'Skilled Player', icon: '🌟' });
    }

    // Champion (25 wins)
    if (stats.playerWins >= 25 && !achievements['champion']) {
        achievements['champion'] = true;
        newAchievements.push({ id: 'champion', name: 'Champion', icon: '👑' });
    }

    // On Fire (3 win streak)
    if (stats.currentStreak >= 3 && !achievements['win-streak']) {
        achievements['win-streak'] = true;
        newAchievements.push({ id: 'win-streak', name: 'On Fire', icon: '🔥' });
    }

    // Save if any new achievements
    if (newAchievements.length > 0) {
        saveAchievements();
        // Show achievement notifications
        newAchievements.forEach((ach, index) => {
            setTimeout(() => {
                showAchievementNotification(ach);
            }, index * 500);
        });
    }
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(13, 110, 253, 0.5);
        z-index: 9999;
        font-family: 'Rajdhani', sans-serif;
        animation: slideInRight 0.5s ease, fadeOut 0.5s ease 3.5s;
        border: 2px solid rgba(255, 255, 255, 0.3);
        min-width: 300px;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 3em;">${achievement.icon}</div>
            <div>
                <div style="font-size: 0.9em; opacity: 0.9; font-weight: 600;">Achievement Unlocked!</div>
                <div style="font-size: 1.3em; font-weight: 800; font-family: 'Orbitron', sans-serif;">${achievement.name}</div>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    playSound('win');

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Add animation styles
const achievementStyle = document.createElement('style');
achievementStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(achievementStyle);

// Reset Statistics
function resetStats() {
    playSound('click');
    if (confirm('Are you sure you want to reset all statistics and achievements?')) {
        stats = {
            totalGames: 0,
            playerWins: 0,
            computerWins: 0,
            draws: 0,
            currentStreak: 0,
            bestStreak: 0
        };

        // Reset achievements
        achievements = {
            'first-win': false,
            'five-wins': false,
            'ten-wins': false,
            'beat-hard': false,
            'win-streak': false,
            'champion': false
        };

        saveStats();
        saveAchievements();
        updateStatsDisplay();
        alert('Statistics and achievements reset successfully!');
    }
}

function resetKidsStats() {
    playSound('click');
    if (confirm('Do you want to reset all your stars and stats? This will start everything fresh!')) {
        kidsStats = {
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            starsCollected: 0
        };

        // Reset kids achievements
        kidsAchievements = {
            'first-win': false,
            'super-star': false,
            'robot-master': false,
            'game-lover': false
        };

        saveKidsStats();
        saveKidsAchievements();
        updateKidsStatsDisplay();
        alert('All stats and badges reset! Time for a fresh start! 🌟');
    }
}

// Show History
function showHistory() {
    playSound('click');
    const container = document.getElementById("historyContainer");
    if (gameHistory.length === 0) {
        container.innerHTML = `<p class="empty-message">No games played yet. Start playing to see your history!</p>`;
    } else {
        container.innerHTML = gameHistory.slice().reverse().map((game, index) => `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-result" style="color: ${game.winner === 'X' ? '#0d6efd' : game.winner === 'O' ? '#dc267f' : '#ffc107'}">
                        ${game.result}
                    </div>
                    <div class="history-time">${game.time}</div>
                </div>
                <div class="history-details">${game.details}</div>
            </div>
        `).join('');
    }
    showScreen('historyScreen');
}

// Show Settings
function showSettings() {
    playSound('click');
    document.getElementById('soundToggle').checked = settings.sound;
    document.getElementById('animationToggle').checked = settings.animations;
    document.getElementById('confettiToggle').checked = settings.confetti;
    document.getElementById('themeSelect').value = settings.theme || 'default';
    showScreen('settingsScreen');
}

// Change Theme
function changeTheme() {
    const themeSelect = document.getElementById('themeSelect');
    settings.theme = themeSelect.value;
    saveSettings();
    applyTheme();
    playSound('click');
}

function applyTheme() {
    document.body.setAttribute('data-theme', settings.theme);
}

// Toggle Settings
function toggleSound() {
    settings.sound = document.getElementById('soundToggle').checked;
    saveSettings();
    if (settings.sound) {
        // Start music if not already started
        if (!musicStarted) {
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    musicShouldPlay = true;
                    createBackgroundMusic();
                    musicStarted = true;
                });
            } else {
                musicShouldPlay = true;
                createBackgroundMusic();
                musicStarted = true;
            }
        } else {
            // Resume music if it was stopped
            musicShouldPlay = true;
            createBackgroundMusic();
        }
    } else {
        // Stop music
        stopBackgroundMusic();
    }
}

function toggleAnimations() {
    settings.animations = document.getElementById('animationToggle').checked;
    saveSettings();
    applySettings();
}

function toggleConfetti() {
    settings.confetti = document.getElementById('confettiToggle').checked;
    saveSettings();
}

function applySettings() {
    // Toggle a class on the body so CSS can globally disable animations and particle layers.
    if (settings.animations) {
        document.body.classList.remove('no-animations');
    } else {
        document.body.classList.add('no-animations');
    }
}

// Show About
function showAbout() {
    playSound('click');
    showScreen('aboutScreen');
}

// Add game to history
function addToHistory(result, winner) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const details = isVsComputer ?
        `${player1Name} vs AI (${['Two Player', 'Easy', 'Medium', 'Hard'][gameMode]})` :
        `${player1Name} vs ${player2Name}`;

    gameHistory.push({
        result: result,
        winner: winner,
        time: time,
        details: details,
        date: now.toISOString()
    });

    // Keep only last 20 games
    if (gameHistory.length > 20) {
        gameHistory = gameHistory.slice(-20);
    }

    saveHistory();
}

// Sound System
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let backgroundMusic = null;
let musicShouldPlay = false;
let musicLoopTimeout = null;
let activeMusicOscillators = [];

// Sound Generator Functions
function playSound(type) {
    if (!settings.sound) return;

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
        case 'move':
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;

        case 'win':
            // Victory fanfare
            [523, 659, 784, 1047].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
                osc.start(audioContext.currentTime + i * 0.15);
                osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
            });
            return;

        case 'draw':
            oscillator.frequency.value = 400;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;

        case 'invalid':
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            break;

        case 'click':
            oscillator.frequency.value = 600;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
            break;

        case 'type':
            oscillator.frequency.value = 1200;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.03);
            break;

        case 'gameStart':
            // Game start sound - ascending notes
            [440, 554, 659].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.25, audioContext.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.2);
                osc.start(audioContext.currentTime + i * 0.1);
                osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
            });
            return;
    }
}

// Stop background music
function stopBackgroundMusic() {
    musicShouldPlay = false;
    if (musicLoopTimeout) {
        clearTimeout(musicLoopTimeout);
        musicLoopTimeout = null;
    }
    // Stop all active music oscillators immediately
    activeMusicOscillators.forEach(osc => {
        try {
            osc.stop();
        } catch (e) {
            // Oscillator might already be stopped
        }
    });
    activeMusicOscillators = [];
}

// Background Music - Professional ambient gaming music (Adult Mode)
function createAdultBackgroundMusic() {
    if (!settings.sound || !musicShouldPlay) return;

    // Clear any existing music loop to prevent double playback
    if (musicLoopTimeout) {
        clearTimeout(musicLoopTimeout);
        musicLoopTimeout = null;
    }

    // Chord progression: Am - F - C - G
    const chordProgressions = [
        [220.00, 261.63, 329.63], // Am (A-C-E)
        [174.61, 220.00, 261.63], // F (F-A-C)
        [130.81, 164.81, 196.00], // C (C-E-G)
        [196.00, 246.94, 293.66]  // G (G-B-D)
    ];

    // Melodic pattern over chords
    const melodyPattern = [
        [440.00, 523.25, 659.25, 523.25], // Pattern 1
        [349.23, 440.00, 523.25, 440.00], // Pattern 2
        [523.25, 659.25, 783.99, 659.25], // Pattern 3
        [392.00, 493.88, 587.33, 493.88]  // Pattern 4
    ];

    let currentChord = 0;
    let beatCount = 0;

    function playChord(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.015, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + duration);

            // Track this oscillator
            activeMusicOscillators.push(osc);
            // Remove from array when it ends
            osc.onended = () => {
                const idx = activeMusicOscillators.indexOf(osc);
                if (idx > -1) activeMusicOscillators.splice(idx, 1);
            };
        });
    }

    function playMelodyNote(freq, delay, duration) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.025, audioContext.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + duration);

        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + duration);

        // Track this oscillator
        activeMusicOscillators.push(osc);
        // Remove from array when it ends
        osc.onended = () => {
            const idx = activeMusicOscillators.indexOf(osc);
            if (idx > -1) activeMusicOscillators.splice(idx, 1);
        };
    }

    function playMusicLoop() {
        if (!settings.sound || !musicShouldPlay) return;

        // Play chord
        playChord(chordProgressions[currentChord], 3.5);

        // Play melody notes over the chord
        melodyPattern[currentChord].forEach((freq, index) => {
            playMelodyNote(freq, index * 0.5, 0.45);
        });

        currentChord = (currentChord + 1) % chordProgressions.length;
        beatCount++;

        if (settings.sound && musicShouldPlay) {
            musicLoopTimeout = setTimeout(playMusicLoop, 2000);
        }
    }

    playMusicLoop();
}

// Background Music - Playful and upbeat music (Kids Mode)
function createKidsBackgroundMusic() {
    if (!settings.sound || !musicShouldPlay) return;

    // Clear any existing music loop to prevent double playback
    if (musicLoopTimeout) {
        clearTimeout(musicLoopTimeout);
        musicLoopTimeout = null;
    }

    // Cheerful, continuous progression: C - G - Am - F (happy, professional)
    const chordProgressions = [
        [261.63, 329.63, 392.00], // C Major (C-E-G)
        [196.00, 246.94, 293.66], // G Major (G-B-D)
        [220.00, 261.63, 329.63], // A Minor (A-C-E)
        [174.61, 220.00, 261.63]  // F Major (F-A-C)
    ];

    // Smooth, flowing melody with overlapping notes
    const melodyNotes = [
        [523.25, 587.33, 659.25, 587.33], // C-D-E-D
        [493.88, 523.25, 587.33, 659.25], // B-C-D-E
        [659.25, 587.33, 523.25, 493.88], // E-D-C-B
        [523.25, 587.33, 659.25, 698.46]  // C-D-E-F
    ];

    let currentChord = 0;

    function playChord(frequencies, delay, duration) {
        frequencies.forEach((freq) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.frequency.value = freq;
            osc.type = 'triangle'; // Warm, pleasant sound

            // Smooth fade in and out for seamless transitions
            gain.gain.setValueAtTime(0.001, audioContext.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.025, audioContext.currentTime + delay + 0.3);
            gain.gain.setValueAtTime(0.025, audioContext.currentTime + delay + duration - 0.4);
            gain.gain.linearRampToValueAtTime(0.001, audioContext.currentTime + delay + duration);

            osc.start(audioContext.currentTime + delay);
            osc.stop(audioContext.currentTime + delay + duration);

            activeMusicOscillators.push(osc);
            osc.onended = () => {
                const idx = activeMusicOscillators.indexOf(osc);
                if (idx > -1) activeMusicOscillators.splice(idx, 1);
            };
        });
    }

    function playMelody(freq, delay, duration) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = freq;
        osc.type = 'sine'; // Pure, clear melody

        // Smooth envelope for continuous flow
        gain.gain.setValueAtTime(0.001, audioContext.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + delay + 0.1);
        gain.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + delay + duration - 0.1);
        gain.gain.linearRampToValueAtTime(0.001, audioContext.currentTime + delay + duration);

        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + duration);

        activeMusicOscillators.push(osc);
        osc.onended = () => {
            const idx = activeMusicOscillators.indexOf(osc);
            if (idx > -1) activeMusicOscillators.splice(idx, 1);
        };
    }

    function playMusicLoop() {
        if (!settings.sound || !musicShouldPlay) return;

        // Play sustained chord with overlap (starts slightly before previous ends)
        playChord(chordProgressions[currentChord], 0, 2.8);

        // Play flowing melody notes with overlap
        melodyNotes[currentChord].forEach((freq, index) => {
            playMelody(freq, index * 0.5, 0.7); // Overlapping notes for continuity
        });

        currentChord = (currentChord + 1) % chordProgressions.length;

        if (settings.sound && musicShouldPlay) {
            // Loop slightly before current iteration ends for seamless flow
            musicLoopTimeout = setTimeout(playMusicLoop, 1800);
        }
    }

    playMusicLoop();
}

// Choose appropriate background music based on current mode
function createBackgroundMusic() {
    if (currentMode === 'kids') {
        createKidsBackgroundMusic();
    } else {
        createAdultBackgroundMusic();
    }
}

// Start background music on first interaction
let musicStarted = false;
document.addEventListener('click', function initMusic() {
    // Just resume audio context on first click
    if (!musicStarted) {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        musicStarted = true;
    }
}, { once: false });

// ===== AGE SELECTION & MODE SWITCHING =====

function selectMode(mode) {
    playSound('click');
    currentMode = mode;

    // Stop any existing music and start appropriate music for selected mode
    stopBackgroundMusic();

    if (settings.sound) {
        musicShouldPlay = true;
        createBackgroundMusic();
    }

    if (mode === 'adult') {
        // Check if user has a profile
        if (!adultProfile.hasProfile) {
            showScreen('adultProfileWelcome');
        } else {
            updateProfileDisplay();
            showScreen('mainMenu');
        }
    } else if (mode === 'kids') {
        showScreen('kidsMainMenu');
    }
}

function backToAgeSelection() {
    playSound('click');
    currentMode = 'age-selection';

    // Stop music when returning to age selection
    stopBackgroundMusic();

    showScreen('ageSelectionScreen');
}

// ===== KIDS MODE FUNCTIONS =====

function kidsShowNameInput(mode) {
    playSound('click');
    kidsPendingGameMode = mode;
    const kidsPlayer2Group = document.getElementById('kidsPlayer2Group');

    if (mode === 'ai') {
        kidsPlayer2Group.style.display = 'none';
        kidsIsVsComputer = true;
    } else {
        kidsPlayer2Group.style.display = 'block';
        kidsIsVsComputer = false;
    }

    // Clear inputs
    document.getElementById('kidsPlayer1Name').value = '';
    document.getElementById('kidsPlayer2Name').value = '';

    showScreen('kidsNameInputScreen');
}

function kidsBackToMenu() {
    playSound('click');
    document.getElementById('kidsResultModal').classList.remove('active');
    showScreen('kidsMainMenu');

    // Resume background music when returning to menu
    if (settings.sound) {
        musicShouldPlay = true;
        createBackgroundMusic();
    }
}

function kidsBackToNameInput() {
    playSound('click');
    showScreen('kidsNameInputScreen');
}

function kidsProceedFromNameInput() {
    playSound('click');
    kidsPlayer1Name = document.getElementById('kidsPlayer1Name').value.trim() || 'Player 1';

    if (kidsPendingGameMode === 'ai') {
        kidsPlayer2Name = 'Robot';
        kidsIsVsComputer = true;
        showScreen('kidsDifficultyScreen');
    } else {
        kidsPlayer2Name = document.getElementById('kidsPlayer2Name').value.trim() || 'Player 2';
        kidsIsVsComputer = false;
        kidsStartGame(0);
    }
}

function kidsStartGame(difficulty) {
    // Stop background music immediately
    stopBackgroundMusic();

    // Play game start sound after brief moment for clean transition
    setTimeout(() => playSound('gameStart'), 50);

    kidsGameMode = difficulty;

    // Update player badges
    document.getElementById('kidsPlayerXBadge').textContent = kidsPlayer1Name;
    document.getElementById('kidsPlayerOBadge').textContent = kidsPlayer2Name;

    kidsResetBoard();
    showScreen('kidsGameScreen');
    kidsUpdateTurnIndicator();
}

function kidsResetBoard() {
    kidsBoard = ['', '', '', '', '', '', '', '', ''];
    kidsCurrentPlayer = 'X';
    kidsGameActive = true;

    const cells = document.querySelectorAll('.kids-cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'taken', 'winning');
    });
}

function kidsHandleCellClick(index) {
    if (!kidsGameActive || kidsBoard[index] !== '' || (kidsIsVsComputer && kidsCurrentPlayer === 'O')) {
        if (kidsBoard[index] !== '') {
            const cell = document.querySelector(`.kids-cell[data-index="${index}"]`);
            cell.classList.add('invalid-move');
            setTimeout(() => cell.classList.remove('invalid-move'), 500);
            playSound('invalid');
        }
        return;
    }

    kidsMakeMove(index, kidsCurrentPlayer);
}

function kidsMakeMove(index, player) {
    kidsBoard[index] = player;
    const cell = document.querySelector(`.kids-cell[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase(), 'taken');
    playSound('move');

    if (kidsCheckWinner(player)) {
        kidsEndGame(player);
        return;
    }

    if (kidsCheckDraw()) {
        kidsEndGame('draw');
        return;
    }

    kidsCurrentPlayer = kidsCurrentPlayer === 'X' ? 'O' : 'X';
    kidsUpdateTurnIndicator();

    if (kidsIsVsComputer && kidsCurrentPlayer === 'O') {
        setTimeout(kidsMakeComputerMove, 600);
    }
}

function kidsUpdateTurnIndicator() {
    const indicator = document.getElementById('kidsTurnIndicator');
    if (kidsIsVsComputer) {
        indicator.textContent = kidsCurrentPlayer === 'X' ?
            `${kidsPlayer1Name}'s Turn! 🎮` : 'Robot is thinking... 🤖';
    } else {
        const playerName = kidsCurrentPlayer === 'X' ? kidsPlayer1Name : kidsPlayer2Name;
        indicator.textContent = `${playerName}'s Turn! 🎮`;
    }
}

function kidsCheckWinner(player) {
    for (let combo of winningCombinations) {
        if (combo.every(index => kidsBoard[index] === player)) {
            kidsHighlightWinningCells(combo);
            return true;
        }
    }
    return false;
}

function kidsHighlightWinningCells(combo) {
    combo.forEach(index => {
        document.querySelector(`.kids-cell[data-index="${index}"]`).classList.add('winning');
    });
}

function kidsCheckDraw() {
    return kidsBoard.every(cell => cell !== '');
}

function kidsEndGame(result) {
    kidsGameActive = false;

    const modal = document.getElementById('kidsResultModal');
    const title = document.getElementById('kidsResultTitle');
    const message = document.getElementById('kidsResultMessage');

    // Update stats
    kidsStats.totalGames++;

    if (result === 'draw') {
        playSound('draw');
        title.textContent = "🤝 It's a Tie!";
        message.textContent = 'Great game! Want to play again?';
        kidsStats.draws++;
    } else if (result === 'X') {
        playSound('win');
        title.textContent = `🎉 ${kidsPlayer1Name} Wins!`;
        message.textContent = 'Awesome job! You are super smart! 🌟';
        kidsStats.wins++;
        kidsStats.starsCollected += 3; // Award 3 stars for winning!
        if (settings.confetti) createKidsConfetti();
    } else {
        playSound('win');
        if (kidsIsVsComputer) {
            title.textContent = '🤖 Robot Wins!';
            message.textContent = "Don't worry! Try again! 💪";
            kidsStats.losses++;
            kidsStats.starsCollected++; // Award 1 star for trying!
        } else {
            title.textContent = `🎉 ${kidsPlayer2Name} Wins!`;
            message.textContent = 'Fantastic! You did it! 🌟';
            kidsStats.losses++;
            if (settings.confetti) createKidsConfetti();
        }
    }

    // Save stats and check achievements
    saveKidsStats();
    checkKidsAchievements();

    setTimeout(() => {
        modal.classList.add('active');
    }, 1000);
}

function createKidsConfetti() {
    const colors = ['#ffd93d', '#ff6b9d', '#6bcf7f', '#4dabf7', '#667eea', '#f093fb'];
    const shapes = ['⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎈'];
    const confettiCount = 60;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.fontSize = Math.random() * 20 + 20 + 'px';
        confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-50px';
        confetti.style.opacity = '1';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(confetti);

        const duration = Math.random() * 3 + 2;
        const endLeft = parseFloat(confetti.style.left) + (Math.random() - 0.5) * 100;

        confetti.animate([
            {
                transform: `translateY(0) rotate(0deg)`,
                opacity: 1
            },
            {
                transform: `translateY(${window.innerHeight + 50}px) translateX(${endLeft - parseFloat(confetti.style.left)}vw) rotate(${Math.random() * 720}deg)`,
                opacity: 0
            }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        setTimeout(() => confetti.remove(), duration * 1000);
    }
}

function kidsMakeComputerMove() {
    if (!kidsGameActive) return;

    let move;
    if (kidsGameMode === 1) {
        move = kidsGetRandomMove();
    } else if (kidsGameMode === 2) {
        move = Math.random() < 0.7 ? kidsGetBestMove() : kidsGetRandomMove();
    } else {
        move = kidsGetBestMove();
    }

    if (move !== -1) {
        kidsMakeMove(move, 'O');
    }
}

function kidsGetRandomMove() {
    const availableMoves = kidsBoard.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
}

function kidsGetBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (kidsBoard[i] === '') {
            kidsBoard[i] = 'O';
            let score = kidsMinimax(kidsBoard, 0, false);
            kidsBoard[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function kidsMinimax(board, depth, isMaximizing) {
    if (kidsCheckWinnerForMinimax('O')) return 10 - depth;
    if (kidsCheckWinnerForMinimax('X')) return depth - 10;
    if (kidsCheckDraw()) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = kidsMinimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = kidsMinimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function kidsCheckWinnerForMinimax(player) {
    return winningCombinations.some(combo =>
        combo.every(index => kidsBoard[index] === player)
    );
}

// Kids Stats & Achievements Functions
function showKidsStats() {
    playSound('click');
    updateKidsStatsDisplay();
    showScreen('kidsStatsScreen');
}

function updateKidsStatsDisplay() {
    document.getElementById('kidsTotalGames').textContent = kidsStats.totalGames;
    document.getElementById('kidsWins').textContent = kidsStats.wins;
    document.getElementById('kidsStars').textContent = kidsStats.starsCollected;
    document.getElementById('kidsDraws').textContent = kidsStats.draws;

    // Update achievements display
    updateKidsAchievementsDisplay();
}

function updateKidsAchievementsDisplay() {
    for (const [key, unlocked] of Object.entries(kidsAchievements)) {
        const card = document.querySelector(`.kids-achievement-card[data-achievement="${key}"]`);
        if (card) {
            if (unlocked) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
            } else {
                card.classList.add('locked');
                card.classList.remove('unlocked');
            }
        }
    }
}

function checkKidsAchievements() {
    let newAchievements = [];

    // First Victory
    if (kidsStats.wins >= 1 && !kidsAchievements['first-win']) {
        kidsAchievements['first-win'] = true;
        newAchievements.push({ id: 'first-win', name: 'First Victory!', icon: '🥇' });
    }

    // Super Star (10 stars)
    if (kidsStats.starsCollected >= 10 && !kidsAchievements['super-star']) {
        kidsAchievements['super-star'] = true;
        newAchievements.push({ id: 'super-star', name: 'Super Star!', icon: '🌟' });
    }

    // Robot Master
    if (kidsStats.wins >= 1 && kidsIsVsComputer && !kidsAchievements['robot-master']) {
        kidsAchievements['robot-master'] = true;
        newAchievements.push({ id: 'robot-master', name: 'Robot Master!', icon: '🤖' });
    }

    // Game Lover (5 games)
    if (kidsStats.totalGames >= 5 && !kidsAchievements['game-lover']) {
        kidsAchievements['game-lover'] = true;
        newAchievements.push({ id: 'game-lover', name: 'Game Lover!', icon: '🎮' });
    }

    // Save and show notifications
    if (newAchievements.length > 0) {
        saveKidsAchievements();
        newAchievements.forEach((ach, index) => {
            setTimeout(() => {
                showKidsAchievementNotification(ach);
            }, (index + 1) * 1500); // Show after modal
        });
    }
}

function showKidsAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ffd93d 0%, #ff6b9d 100%);
        color: white;
        padding: 25px 35px;
        border-radius: 25px;
        box-shadow: 0 15px 50px rgba(255, 107, 157, 0.6);
        z-index: 9999;
        font-family: 'Rajdhani', sans-serif;
        animation: kidsBadgeSlideIn 0.5s ease, kidsBadgeFadeOut 0.5s ease 3.5s;
        border: 4px solid rgba(255, 255, 255, 0.5);
        min-width: 320px;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px;">
            <div style="font-size: 4em;">${achievement.icon}</div>
            <div>
                <div style="font-size: 1.1em; opacity: 0.95; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏅 New Badge Earned! 🏅</div>
                <div style="font-size: 1.5em; font-weight: 900; margin-top: 5px; text-shadow: 0 3px 6px rgba(0,0,0,0.3);">${achievement.name}</div>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    playSound('win');

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Add animation styles for kids badges
const kidsAchievementStyle = document.createElement('style');
kidsAchievementStyle.textContent = `
    @keyframes kidsBadgeSlideIn {
        from {
            transform: translateX(400px) rotate(10deg);
            opacity: 0;
        }
        to {
            transform: translateX(0) rotate(0deg);
            opacity: 1;
        }
    }
    
    @keyframes kidsBadgeFadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }
`;
document.head.appendChild(kidsAchievementStyle);

function kidsRestartGame() {
    playSound('click');
    document.getElementById('kidsResultModal').classList.remove('active');
    kidsResetBoard();
    kidsUpdateTurnIndicator();
}

