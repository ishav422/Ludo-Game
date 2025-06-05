document.addEventListener('DOMContentLoaded', function() {
    // Game State
    const gameState = {
        currentPlayer: 'red',
        diceValue: 1,
        gameStarted: false,
        players: {
            red: {
                tokens: [0, 0, 0, 0], // Position on board (0 = home)
                score: 0
            },
            blue: {
                tokens: [0, 0, 0, 0],
                score: 0
            }
        },
        soundEnabled: true,
        musicEnabled: true,
        gameMode: 'classic',
        winningScore: 20
    };

    // DOM Elements
    const homepage = document.getElementById('homepage');
    const gamepage = document.getElementById('gamepage');
    const playNowBtn = document.getElementById('playNowBtn');
    const backToHome = document.getElementById('backToHome');
    const modeCards = document.querySelectorAll('.mode-card');
    const rollDiceBtn = document.getElementById('rollDice');
    const dice = document.getElementById('dice');
    const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
    const gameModeDisplay = document.getElementById('gameModeDisplay');
    const soundToggle = document.getElementById('soundToggle');
    const menuToggle = document.getElementById('menuToggle');
    const gameMenu = document.getElementById('gameMenu');
    const newGameBtn = document.getElementById('newGameBtn');
    const howToPlayBtn = document.getElementById('howToPlayBtn');
    const howToPlayBtn2 = document.getElementById('howToPlayBtn2');
    const howToPlayModal = document.getElementById('howToPlayModal');
    const closeHowToPlayBtn = document.getElementById('closeHowToPlayBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const doubleBtn = document.getElementById('doubleBtn');
    const quitBtn = document.getElementById('quitBtn');
    const toast = document.getElementById('toast');
    
    // Audio Elements
    const diceSound = document.getElementById('diceSound');
    const moveSound = document.getElementById('moveSound');
    const winSound = document.getElementById('winSound');
    const bgMusic = document.getElementById('bgMusic');

    // Initialize the game board
    initGameBoard();
    
    // Event Listeners
    playNowBtn.addEventListener('click', function() {
        homepage.classList.remove('active');
        gamepage.classList.add('active');
        startGame('classic');
        if (gameState.musicEnabled) {
            bgMusic.play().catch(e => console.log('Autoplay prevented:', e));
        }
    });
    
    backToHome.addEventListener('click', function() {
        gamepage.classList.remove('active');
        homepage.classList.add('active');
        resetGame();
        bgMusic.pause();
    });
    
    modeCards.forEach(card => {
        card.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            homepage.classList.remove('active');
            gamepage.classList.add('active');
            startGame(mode);
            if (gameState.musicEnabled) {
                bgMusic.play().catch(e => console.log('Autoplay prevented:', e));
            }
        });
    });
    
    rollDiceBtn.addEventListener('click', rollDice);
    
    soundToggle.addEventListener('click', toggleSound);
    
    menuToggle.addEventListener('click', function() {
        gameMenu.classList.add('active');
    });
    
    newGameBtn.addEventListener('click', function() {
        gameMenu.classList.remove('active');
        resetGame();
        startGame(gameState.gameMode);
    });
    
    howToPlayBtn.addEventListener('click', function() {
        howToPlayModal.classList.add('active');
    });
    
    howToPlayBtn2.addEventListener('click', function() {
        gameMenu.classList.remove('active');
        howToPlayModal.classList.add('active');
    });
    
    closeHowToPlayBtn.addEventListener('click', function() {
        howToPlayModal.classList.remove('active');
    });
    
    closeMenuBtn.addEventListener('click', function() {
        gameMenu.classList.remove('active');
    });
    
    doubleBtn.addEventListener('click', function() {
        showToast('Double feature coming soon!');
    });
    
    quitBtn.addEventListener('click', function() {
        gamepage.classList.remove('active');
        homepage.classList.add('active');
        resetGame();
        bgMusic.pause();
    });
    
    // Initialize token click events
    document.querySelectorAll('.token').forEach(token => {
        token.addEventListener('click', handleTokenClick);
    });

    // Functions
    function initGameBoard() {
        const board = document.querySelector('.game-board');
        
        // Clear any existing cells
        board.innerHTML = '';
        
        // Create 15x15 grid
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                
                // Add color zones
                if ((row < 6 && col < 6) || (row >= 9 && col >= 9)) {
                    // Red zone (top-left and bottom-right quadrants)
                    cell.classList.add('red');
                } else if ((row < 6 && col >= 9) || (row >= 9 && col < 6)) {
                    // Blue zone (top-right and bottom-left quadrants)
                    cell.classList.add('blue');
                }
                
                // Add center cell
                if (row >= 6 && row < 9 && col >= 6 && col < 9) {
                    if (row === 7 && col === 7) {
                        cell.classList.add('center');
                    }
                }
                
                // Add position attribute
                cell.setAttribute('data-position', `${row},${col}`);
                
                board.appendChild(cell);
            }
        }
        
        // Add center dice container
        const centerContainer = document.createElement('div');
        centerContainer.className = 'board-center';
        centerContainer.innerHTML = `
            <div class="dice-container">
                <div id="dice" class="dice">
                    <div class="dice-face" data-face="1"></div>
                    <div class="dice-face" data-face="2"></div>
                    <div class="dice-face" data-face="3"></div>
                    <div class="dice-face" data-face="4"></div>
                    <div class="dice-face" data-face="5"></div>
                    <div class="dice-face" data-face="6"></div>
                </div>
                <button id="rollDice" class="btn btn-primary">ROLL DICE</button>
            </div>
        `;
        
        const centerCell = document.querySelector('.board-cell.center');
        centerCell.appendChild(centerContainer);
    }
    
    function startGame(mode) {
        gameState.gameMode = mode;
        gameState.gameStarted = true;
        gameModeDisplay.textContent = `${mode.toUpperCase()} MODE`;
        
        // Set winning score based on mode
        switch(mode) {
            case 'quick':
                gameState.winningScore = 15;
                break;
            case 'tournament':
                gameState.winningScore = 30;
                break;
            default: // classic
                gameState.winningScore = 20;
        }
        
        // Reset player positions and scores
        gameState.players.red.tokens = [0, 0, 0, 0];
        gameState.players.blue.tokens = [0, 0, 0, 0];
        gameState.players.red.score = 0;
        gameState.players.blue.score = 0;
        gameState.currentPlayer = 'red';
        
        updatePlayerDisplay();
        updateTokens();
        updateScores();
        
        showToast(`Game started! ${gameState.currentPlayer.toUpperCase()} player's turn`);
    }
    
    function resetGame() {
        gameState.gameStarted = false;
        gameState.currentPlayer = 'red';
        gameState.diceValue = 1;
        
        // Reset dice display
        dice.style.transform = 'rotateX(0deg) rotateY(0deg)';
        
        // Reset tokens
        document.querySelectorAll('.token').forEach(token => {
            token.classList.remove('active', 'selectable');
        });
        
        // Clear any tokens from the board
        document.querySelectorAll('.board-cell').forEach(cell => {
            const tokensInCell = cell.querySelectorAll('.token-on-board');
            tokensInCell.forEach(token => token.remove());
        });
    }
    
    function rollDice() {
        if (!gameState.gameStarted) return;
        
        // Disable roll button during animation
        rollDiceBtn.disabled = true;
        
        // Play sound
        if (gameState.soundEnabled) {
            diceSound.currentTime = 0;
            diceSound.play();
        }
        
        // Generate random dice value
        const diceValue = Math.floor(Math.random() * 6) + 1;
        gameState.diceValue = diceValue;
        
        // Animate dice roll
        const rotations = 5 + Math.random() * 5; // 5-10 rotations
        const duration = 1000 + Math.random() * 500; // 1000-1500ms
        
        let rotationX = Math.random() * 360;
        let rotationY = Math.random() * 360;
        
        // Add extra rotations for visual effect
        rotationX += rotations * 360;
        rotationY += rotations * 360;
        
        dice.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
        dice.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
        
        // After animation, show the correct face
        setTimeout(() => {
            // Reset transition for smooth face changes
            dice.style.transition = 'transform 0.3s ease';
            
            // Calculate final rotation to show the correct face
            let finalRotationX = 0;
            let finalRotationY = 0;
            
            // These values position each face correctly
            switch(diceValue) {
                case 1:
                    finalRotationX = 0;
                    finalRotationY = 0;
                    break;
                case 2:
                    finalRotationX = 0;
                    finalRotationY = 90;
                    break;
                case 3:
                    finalRotationX = 90;
                    finalRotationY = 0;
                    break;
                case 4:
                    finalRotationX = -90;
                    finalRotationY = 0;
                    break;
                case 5:
                    finalRotationX = 0;
                    finalRotationY = -90;
                    break;
                case 6:
                    finalRotationX = 0;
                    finalRotationY = 180;
                    break;
            }
            
            dice.style.transform = `rotateX(${finalRotationX}deg) rotateY(${finalRotationY}deg)`;
            
            // Check if player can move any token
            const canMove = checkMovableTokens(gameState.currentPlayer, diceValue);
            
            if (canMove) {
                showToast(`You rolled a ${diceValue}! Select a token to move`);
                
                // Highlight movable tokens
                highlightMovableTokens(gameState.currentPlayer, diceValue);
            } else {
                showToast(`You rolled a ${diceValue} but can't move. Switching turns`);
                setTimeout(switchPlayer, 1000);
            }
            
            // Re-enable roll button
            rollDiceBtn.disabled = false;
        }, duration);
    }
    
    function checkMovableTokens(player, diceValue) {
        const tokens = gameState.players[player].tokens;
        
        // Check if any token can move
        for (let i = 0; i < tokens.length; i++) {
            const currentPosition = tokens[i];
            
            // Token is at home and player rolled a 6
            if (currentPosition === 0 && diceValue === 6) {
                return true;
            }
            
            // Token is on the board and can move
            if (currentPosition > 0 && currentPosition + diceValue <= 56) {
                return true;
            }
        }
        
        return false;
    }
    
    function highlightMovableTokens(player, diceValue) {
        const tokens = gameState.players[player].tokens;
        
        // Get all token elements for this player
        const tokenElements = document.querySelectorAll(`.token.${player}`);
        
        tokenElements.forEach((tokenEl, index) => {
            const currentPosition = tokens[index];
            
            // Token is at home and player rolled a 6
            if (currentPosition === 0 && diceValue === 6) {
                tokenEl.classList.add('selectable');
                return;
            }
            
            // Token is on the board and can move
            if (currentPosition > 0 && currentPosition + diceValue <= 56) {
                tokenEl.classList.add('selectable');
            }
        });
    }
    
    function handleTokenClick(e) {
        if (!gameState.gameStarted) return;
        
        const tokenEl = e.currentTarget;
        const player = tokenEl.classList.contains('red') ? 'red' : 'blue';
        
        // Only allow current player to move their tokens
        if (player !== gameState.currentPlayer) return;
        
        // Only allow moving if token is selectable
        if (!tokenEl.classList.contains('selectable')) return;
        
        const tokenIndex = parseInt(tokenEl.getAttribute('data-token')) - 1;
        const currentPosition = gameState.players[player].tokens[tokenIndex];
        const diceValue = gameState.diceValue;
        
        // Calculate new position
        let newPosition;
        if (currentPosition === 0) {
            // Token is at home, starting its journey
            newPosition = 1;
        } else {
            newPosition = currentPosition + diceValue;
        }
        
        // Check if new position exceeds board limit
        if (newPosition > 56) {
            showToast("Can't move beyond the board!");
            return;
        }
        
        // Move the token
        moveToken(player, tokenIndex, newPosition);
        
        // Play move sound
        if (gameState.soundEnabled) {
            moveSound.currentTime = 0;
            moveSound.play();
        }
        
        // Check for win condition
        if (checkWinCondition(player)) {
            endGame(player);
            return;
        }
        
        // Switch player if not a 6
        if (diceValue !== 6) {
            setTimeout(switchPlayer, 1000);
        } else {
            showToast(`${player.toUpperCase()} gets another turn!`);
            // Allow player to roll again
        }
    }
    
    function moveToken(player, tokenIndex, newPosition) {
        // Remove token from old position
        const oldPosition = gameState.players[player].tokens[tokenIndex];
        if (oldPosition > 0) {
            const oldCell = getCellByPosition(oldPosition, player);
            if (oldCell) {
                const tokenOnBoard = oldCell.querySelector(`.token-on-board.${player}[data-token="${tokenIndex + 1}"]`);
                if (tokenOnBoard) {
                    tokenOnBoard.remove();
                }
            }
        }
        
        // Update token position
        gameState.players[player].tokens[tokenIndex] = newPosition;
        
        // Place token on new position
        if (newPosition > 0) {
            const newCell = getCellByPosition(newPosition, player);
            if (newCell) {
                const tokenEl = document.createElement('div');
                tokenEl.className = `token-on-board token ${player}`;
                tokenEl.setAttribute('data-token', tokenIndex + 1);
                newCell.appendChild(tokenEl);
                
                // Check for opponent tokens to send home
                checkForOpponentTokens(player, newCell);
            }
        }
        
        // Update score if token reached center
        if (newPosition === 57) { // 57 represents the center
            gameState.players[player].score++;
            updateScores();
        }
        
        // Clear selectable tokens
        clearSelectableTokens();
        
        // Update tokens display
        updateTokens();
    }
    
    function getCellByPosition(position, player) {
        // This is a simplified path calculation for a Ludo board
        // In a full implementation, this would calculate the exact path for each player
        
        // For demo purposes, we'll just distribute positions around the board
        const cells = document.querySelectorAll('.board-cell:not(.center)');
        const index = (position - 1) % cells.length;
        return cells[index];
    }
    
    function checkForOpponentTokens(player, cell) {
        const opponent = player === 'red' ? 'blue' : 'red';
        const opponentTokens = cell.querySelectorAll(`.token-on-board.${opponent}`);
        
        if (opponentTokens.length > 0) {
            // Send opponent tokens home
            opponentTokens.forEach(tokenEl => {
                const tokenIndex = parseInt(tokenEl.getAttribute('data-token')) - 1;
                gameState.players[opponent].tokens[tokenIndex] = 0;
                tokenEl.remove();
            });
            
            showToast(`${player.toUpperCase()} sent ${opponent.toUpperCase()} tokens home!`);
            
            // Play sound effect
            if (gameState.soundEnabled) {
                moveSound.currentTime = 0;
                moveSound.play();
            }
            
            updateTokens();
        }
    }
    
    function clearSelectableTokens() {
        document.querySelectorAll('.token.selectable').forEach(token => {
            token.classList.remove('selectable');
        });
    }
    
    function switchPlayer() {
        gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
        updatePlayerDisplay();
        showToast(`${gameState.currentPlayer.toUpperCase()} player's turn`);
    }
    
    function checkWinCondition(player) {
        return gameState.players[player].score >= gameState.winningScore;
    }
    
    function endGame(winner) {
        gameState.gameStarted = false;
        
        // Play win sound
        if (gameState.soundEnabled) {
            winSound.currentTime = 0;
            winSound.play();
        }
        
        showToast(`${winner.toUpperCase()} PLAYER WINS!`, 5000);
        
        // Show win modal or other celebration
        setTimeout(() => {
            alert(`${winner.toUpperCase()} PLAYER WINS THE GAME!`);
            resetGame();
        }, 1000);
    }
    
    function updatePlayerDisplay() {
        currentPlayerDisplay.textContent = `${gameState.currentPlayer.toUpperCase()} PLAYER'S TURN`;
        currentPlayerDisplay.style.color = gameState.currentPlayer === 'red' ? 'var(--red-player)' : 'var(--blue-player)';
    }
    
    function updateTokens() {
        // Update red tokens
        gameState.players.red.tokens.forEach((position, index) => {
            const tokenEl = document.querySelector(`.token.red[data-token="${index + 1}"]`);
            if (position === 0) {
                tokenEl.classList.remove('active');
            } else {
                tokenEl.classList.add('active');
            }
        });
        
        // Update blue tokens
        gameState.players.blue.tokens.forEach((position, index) => {
            const tokenEl = document.querySelector(`.token.blue[data-token="${index + 1}"]`);
            if (position === 0) {
                tokenEl.classList.remove('active');
            } else {
                tokenEl.classList.add('active');
            }
        });
    }
    
    function updateScores() {
        document.querySelector('.player-red .player-score').textContent = `₹${gameState.players.red.score * 10}`;
        document.querySelector('.player-blue .player-score').textContent = `₹${gameState.players.blue.score * 10}`;
    }
    
    function toggleSound() {
        gameState.soundEnabled = !gameState.soundEnabled;
        gameState.musicEnabled = !gameState.musicEnabled;
        
        if (gameState.soundEnabled) {
            soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            if (gameState.musicEnabled) {
                bgMusic.play().catch(e => console.log('Autoplay prevented:', e));
            }
        } else {
            soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            bgMusic.pause();
        }
    }
    
    function showToast(message, duration = 3000) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
    
    // Initialize testimonials slider
    initTestimonialSlider();
    
    function initTestimonialSlider() {
        const testimonials = document.querySelectorAll('.testimonial');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        let currentIndex = 0;
        
        function showTestimonial(index) {
            testimonials.forEach(testimonial => {
                testimonial.classList.remove('active');
            });
            
            testimonials[index].classList.add('active');
        }
        
        prevBtn.addEventListener('click', function() {
            currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
            showTestimonial(currentIndex);
        });
        
        nextBtn.addEventListener('click', function() {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        });
        
        // Auto-rotate testimonials
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 5000);
    }
});
