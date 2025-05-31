document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos HTML
    const startScreen = document.getElementById('start-screen');
    const levelSelectScreen = document.getElementById('level-select-screen');
    const gameScreen = document.getElementById('game-screen');
    const settingsModalOverlay = document.getElementById('settings-modal-overlay');
    const startButtonMainMenu = document.getElementById('start-button-main-menu');
    const controlsButtonMainMenu = document.getElementById('controls-button-main-menu');
    const levelEasyButton = document.getElementById('level-easy-button');
    const levelMediumButton = document.getElementById('level-medium-button');
    const levelHardButton = document.getElementById('level-hard-button');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const gamePlayArea = document.getElementById('game-play-area');
    const scoreDisplay = document.getElementById('score');
    const musicTimeDisplay = document.getElementById('music-time');
    const musicNameDisplay = document.getElementById('music-name');
    const currentDateTimeDisplay = document.getElementById('current-date-time');
    const targetArrowsContainer = document.getElementById('target-arrows');
    const feedbackMessage = document.getElementById('feedback-message');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const musicPrompt = document.getElementById('music-prompt');
    const videoErrorPrompt = document.getElementById('video-error-prompt');
    const startGameOverlayButton = document.getElementById('start-game-overlay-button');
    const settingsButtonGame = document.getElementById('settings-button-game');
    const pauseButton = document.getElementById('pause-button');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const backToMenuFromSettingsButton = document.getElementById('back-to-menu-from-settings');
    const modeAndroidBtn = document.getElementById('mode-android-btn');
    const modePCBtn = document.getElementById('mode-pc-btn');
    const modeGamepadBtn = document.getElementById('mode-gamepad-btn');
    const musicLamineBtn = document.getElementById('music-lamine-btn');
    const musicFeelGoodBtn = document.getElementById('music-feelgood-btn');
    const musicJungleBtn = document.getElementById('music-jungle-btn');
    const keyMappingSection = document.getElementById('key-mapping-section');
    const keyMappingTableBody = document.querySelector('#key-mapping-table tbody');
    const gamepadMappingSection = document.getElementById('gamepad-mapping-section');
    const gamepadMappingTableBody = document.querySelector('#gamepad-mapping-table tbody');
    const noGamepadMessage = document.getElementById('no-gamepad-message');
    const gamepadConnectedName = document.getElementById('gamepad-connected-name');
    const noKeyboardMessage = document.getElementById('no-keyboard-message');
    const selectedMusicDisplay = document.getElementById('selected-music-display');
    const gameBackgroundVideo = document.getElementById('gameBackgroundVideo');
    const gameBackgroundImage = document.getElementById('gameBackgroundImage');
    const bgImageBtn = document.getElementById('bg-image-btn');
    const bgVideoBtn = document.getElementById('bg-video-btn');
    const bgVideoFeelGoodBtn = document.getElementById('bg-video-feelgood-btn');
    const bgVideoJungleBtn = document.getElementById('bg-video-jungle-btn');

    // Variables del juego
    let score = 0;
    let arrowSpeed = 5;
    let arrowSpawnInterval = 1000;
    let currentLevel = null;
    let targetY = 0;
    let targetHeight = 0;
    const hitTolerance = 30;
    // Asegúrate de que las rutas a los sonidos sean correctas
    const perfectSound = new Audio('assets/sounds/perfect_sound.wav');
    const missSound = new Audio('assets/sounds/miss_sound.wav');
    let musicHasStartedEver = false;
    let gameActive = false;
    let arrowSpawnIntervalId;
    let gameLoopId;
    let musicDuration = 0;
    let musicTimeInterval;
    let lastArrowIndex = -1;
    let lastScreenBeforeSettings = null;
    let musicChoice = localStorage.getItem('musicChoice') || 'lamine_yamal';
    let activeHoldArrow = null;
    let holdIntervalId = null;
    let holdStartTime = null;
    let videoPlaybackAttempted = false;
    let backgroundType = localStorage.getItem('backgroundType') || 'video';
    let backgroundVideoChoice = localStorage.getItem('backgroundVideoChoice') || 'feel_good';

    // Configuración de música
    const musicOptions = {
        'lamine_yamal': { src: 'musica_fondo.mp3', name: 'Lamine Yamal' },
        'feel_good': { src: 'Gorillaz - Feel Good Inc. (Official Video).mp3', name: 'Feel Good' },
        'jungle': { src: 'WelcomeToTheJungle.mp3', name: 'Welcome To The Jungle' }
    };

    // Configuración de videos de fondo
    const videoOptions = {
        'feel_good': { src: 'Gorillaz - Feel Good Inc. (Official Video).mp4', name: 'Feel Good' },
        'jungle': { src: 'WelcomeToTheJungle.mp4', name: 'Welcome To The Jungle' }
    };

    // Configuración de controles
    let controlMode = localStorage.getItem('controlMode') || 'pc';
    const defaultCustomKeyMap = {
        'ArrowLeft': 'ArrowLeft',
        'ArrowDown': 'ArrowDown',
        'ArrowUp': 'ArrowUp',
        'ArrowRight': 'ArrowRight',
        'KeyA': 'ArrowLeft',
        'KeyS': 'ArrowDown',
        'KeyW': 'ArrowUp',
        'KeyD': 'ArrowRight'
    };
    let customKeyMap = JSON.parse(localStorage.getItem('customKeyMap')) || defaultCustomKeyMap;
    let hasKeyboardBeenPressed = false;
    const defaultGamepadMap = {
        'Button0': 'ArrowDown',
        'Button1': 'ArrowRight',
        'Button2': 'ArrowLeft',
        'Button3': 'ArrowUp'
    };
    let customGamepadMap = JSON.parse(localStorage.getItem('customGamepadMap')) || defaultGamepadMap;
    let activeKeyMapInput = null;

    // Función para actualizar la fecha y hora
    const updateDateTime = () => {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        currentDateTimeDisplay.textContent = now.toLocaleString('es-ES', options);
    };
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // Improved background handling
    gameBackgroundVideo.addEventListener('error', () => {
        console.error('Error loading video, switching to image fallback.');
        videoErrorPrompt.textContent = 'Video no disponible, usando imagen de fondo.';
        videoErrorPrompt.style.display = 'block';
        backgroundType = 'image';
        localStorage.setItem('backgroundType', 'image');
        updateBackground();
    });

    gameBackgroundVideo.addEventListener('loadeddata', () => {
        if (backgroundType === 'video') {
            gameBackgroundVideo.style.display = 'block';
            attemptVideoPlayback();
        }
    });

    const bgImage = new Image();
    bgImage.src = 'fondo_fnf.jpg'; // Asegúrate de que esta ruta sea correcta
    bgImage.onload = () => {
        console.log('Image background loaded successfully.');
        if (backgroundType === 'image') {
            gameBackgroundImage.style.display = 'block';
            gameBackgroundVideo.style.display = 'none';
        }
    };
    bgImage.onerror = () => {
        console.error('Image background failed to load, using solid color.');
        videoErrorPrompt.textContent = 'Imagen no disponible, usando color sólido.';
        videoErrorPrompt.style.display = 'block';
        gameBackgroundImage.style.display = 'none';
        gamePlayArea.style.backgroundColor = '#333';
    };

    const attemptVideoPlayback = () => {
        if (videoPlaybackAttempted || backgroundType !== 'video') return;
        videoPlaybackAttempted = true;
        gameBackgroundVideo.play().catch(() => {
            console.warn('Video playback blocked, using image fallback.');
            backgroundType = 'image';
            localStorage.setItem('backgroundType', 'image');
            updateBackground();
        });
    };

    const updateBackground = () => {
        if (backgroundType === 'video') {
            gameBackgroundVideo.innerHTML = '';
            const source = document.createElement('source');
            source.src = videoOptions[backgroundVideoChoice].src;
            source.type = 'video/mp4';
            gameBackgroundVideo.appendChild(source);
            gameBackgroundVideo.load();
            gameBackgroundVideo.style.display = 'block';
            gameBackgroundImage.style.display = 'none';
            if (gameBackgroundVideo.readyState >= 2) attemptVideoPlayback();
        } else {
            gameBackgroundVideo.style.display = 'none';
            gameBackgroundVideo.pause();
            if (bgImage.complete && bgImage.naturalHeight > 0) {
                gameBackgroundImage.style.display = 'block';
            } else {
                gameBackgroundImage.style.display = 'none';
                gamePlayArea.style.backgroundColor = '#333';
            }
        }
    };

    // Manejo de errores para recursos
    backgroundMusic.addEventListener('error', () => {
        console.error('Error al cargar la música:', musicOptions[musicChoice].src);
        musicPrompt.textContent = 'No se pudo cargar la música. Verifica las rutas o permisos.';
        musicPrompt.style.display = 'block';
    });
    perfectSound.addEventListener('error', () => {
        console.error('Error al cargar el sonido de "perfecto": assets/sounds/perfect_sound.wav');
    });
    missSound.addEventListener('error', () => {
        console.error('Error al cargar el sonido de "fallo": assets/sounds/miss_sound.wav');
    });

    // Función para formatear tiempo
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Actualizar el tiempo de la música
    const updateMusicTime = () => {
        if (backgroundMusic && gameActive) {
            const currentTime = backgroundMusic.currentTime;
            musicTimeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(musicDuration)}`;
        }
    };

    // Función de debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Funciones de control de pantallas
    const showScreen = (screenToShow) => {
        console.log('Mostrando pantalla:', screenToShow.id || 'settings-modal-overlay');
        startScreen.classList.remove('active');
        levelSelectScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        settingsModalOverlay.style.display = 'none';
        if (screenToShow === settingsModalOverlay) {
            settingsModalOverlay.style.display = 'flex';
        } else {
            screenToShow.classList.add('active');
        }
        if (backgroundMusic) {
            backgroundMusic.volume = screenToShow === gameScreen && gameActive ? 0.5 :
                                    screenToShow === settingsModalOverlay ? 0.2 : 0.8;
        }
        if (screenToShow === gameScreen && gameActive) {
            updateBackground();
            if (backgroundType === 'video') attemptVideoPlayback();
        } else {
            gameBackgroundVideo.pause();
        }
        startGameOverlayButton.style.display = screenToShow !== gameScreen || gameActive ? 'none' : 'block';
        musicPrompt.style.display = 'none';
        videoErrorPrompt.style.display = 'none';
        pauseButton.style.display = screenToShow === gameScreen ? 'flex' : 'none';
        pauseButton.textContent = gameActive ? '⏸' : '▶';
        if (screenToShow === levelSelectScreen) {
            selectedMusicDisplay.textContent = `Música: ${musicOptions[musicChoice].name}`;
        }
    };

    // Funciones principales del juego
    const startGame = (level) => {
        currentLevel = level;
        const levelConfig = {
            easy: { spawnInterval: 2000, speed: 3, pattern: 'random', longArrows: false, doubleArrows: false },
            medium: { spawnInterval: 1500, speed: 5, pattern: 'mixed', longArrows: true, doubleArrows: false },
            hard: { spawnInterval: 500, speed: 7, pattern: 'staircase', longArrows: true, doubleArrows: true }
        };
        arrowSpawnInterval = levelConfig[level].spawnInterval;
        arrowSpeed = levelConfig[level].speed;
        lastArrowIndex = -1;

        if (!targetArrowsContainer) {
            console.error("El elemento 'target-arrows' no se encontró.");
            return;
        }
        targetY = targetArrowsContainer.offsetTop;
        targetHeight = targetArrowsContainer.offsetHeight;
        showScreen(gameScreen);
        score = 0;
        scoreDisplay.textContent = `Puntuación: ${score}`;
        document.querySelectorAll('.falling-arrow').forEach(arrow => arrow.remove());
        pauseButton.textContent = '⏸';
        pauseButton.style.display = 'flex';
        musicNameDisplay.textContent = musicOptions[musicChoice].name;
        videoPlaybackAttempted = false;
        if (backgroundMusic) {
            backgroundMusic.src = musicOptions[musicChoice].src;
            backgroundMusic.load();
            backgroundMusic.play().then(() => {
                musicHasStartedEver = true;
                musicDuration = backgroundMusic.duration || 0;
                musicTimeDisplay.textContent = `0:00 / ${formatTime(musicDuration)}`;
                musicTimeInterval = setInterval(updateMusicTime, 1000);
                resumeGame();
            }).catch(e => {
                console.warn("La reproducción automática de la música fue bloqueada:", e);
                startGameOverlayButton.textContent = "TOCA PARA INICIAR (Permitir Música)";
                startGameOverlayButton.style.display = 'block';
                musicPrompt.textContent = "Tu navegador requiere un toque para iniciar la música y el juego.";
                musicPrompt.style.display = 'block';
                gameActive = false;
                pauseButton.style.display = 'none';
            });
        } else {
            resumeGame();
        }
        updateBackground();
    };

    const resumeGame = () => {
        if (gameActive) return;
        gameActive = true;
        startGameOverlayButton.style.display = 'none';
        musicPrompt.style.display = 'none';
        videoErrorPrompt.style.display = 'none';
        arrowSpawnIntervalId = setInterval(spawnArrow, arrowSpawnInterval);
        gameLoopId = requestAnimationFrame(gameLoop);
        feedbackMessage.style.opacity = 0;
        if (backgroundMusic && backgroundMusic.paused && musicHasStartedEver) {
            backgroundMusic.play().catch(e => console.error("Error al reanudar la música:", e));
            musicTimeInterval = setInterval(updateMusicTime, 1000);
        }
        backgroundMusic.volume = 0.5;
        updateBackground();
        pauseButton.textContent = '⏸';
        pauseButton.style.display = 'flex';
    };

    const pauseGame = () => {
        if (!gameActive) return;
        gameActive = false;
        clearInterval(arrowSpawnIntervalId);
        cancelAnimationFrame(gameLoopId);
        backgroundMusic.pause();
        clearInterval(musicTimeInterval);
        if (holdIntervalId) {
            clearInterval(holdIntervalId);
            holdIntervalId = null;
            activeHoldArrow = null;
        }
        gameBackgroundVideo.pause();
        startGameOverlayButton.textContent = "JUEGO PAUSADO - REANUDAR";
        startGameOverlayButton.style.display = 'block';
        musicPrompt.style.display = 'none';
        videoErrorPrompt.style.display = 'none';
        pauseButton.textContent = '▶';
    };

    const endGame = () => {
        pauseGame();
        alert(`¡Juego Terminado! Tu puntuación final: ${score}`);
        showScreen(startScreen);
        backgroundMusic.currentTime = 0;
        backgroundMusic.pause();
        musicHasStartedEver = false;
        clearInterval(musicTimeInterval);
        gameBackgroundVideo.pause();
        gameBackgroundVideo.currentTime = 0;
        document.querySelectorAll('.falling-arrow').forEach(arrow => arrow.remove());
        startGameOverlayButton.style.display = 'none';
        musicPrompt.style.display = 'none';
        videoErrorPrompt.style.display = 'none';
        pauseButton.style.display = 'none';
        cleanupEventListeners();
    };

    backgroundMusic.addEventListener('ended', () => {
        if (gameActive) endGame();
    });

    const cleanupEventListeners = () => {
        document.removeEventListener('keydown', captureKeyForMapping);
        console.log('Event listeners limpiados');
    };

    const gameLoop = () => {
        if (!gameActive) return;
        const arrowHeight = 70;
        const longArrowHeight = 200;
        const missThreshold = targetY + targetHeight + hitTolerance;
        document.querySelectorAll('.falling-arrow').forEach(arrow => {
            let currentTop = parseFloat(arrow.style.top);
            arrow.style.top = `${currentTop + arrowSpeed}px`;
            const arrowBottom = currentTop + (arrow.classList.contains('long') ? longArrowHeight : arrowHeight);
            if (arrowBottom > missThreshold && !arrow.classList.contains('hit') && !arrow.classList.contains('hold')) {
                arrow.classList.add('hit');
                setTimeout(() => arrow.remove(), 200);
                score -= 200;
                scoreDisplay.textContent = `Puntuación: ${score}`;
                showFeedback('¡FALLO!', 'bad');
                missSound.play().catch(() => console.error('Error al reproducir missSound'));
            }
        });
        gameLoopId = requestAnimationFrame(gameLoop);
    };

    const spawnArrow = () => {
        const arrowTypes = ['left', 'down', 'up', 'right'];
        let arrowType;
        const levelConfig = {
            easy: { pattern: 'random' },
            medium: { pattern: 'mixed' },
            hard: { pattern: 'staircase' }
        }[currentLevel] || { pattern: 'random' };

        switch (levelConfig.pattern) {
            case 'staircase':
                lastArrowIndex = (lastArrowIndex + 1) % arrowTypes.length;
                arrowType = arrowTypes[lastArrowIndex];
                break;
            case 'mixed':
                arrowType = Math.random() < 0.5 ?
                    arrowTypes[(lastArrowIndex = (lastArrowIndex + 1) % arrowTypes.length)] :
                    arrowTypes[Math.floor(Math.random() * arrowTypes.length)];
                break;
            default:
                arrowType = arrowTypes[Math.floor(Math.random() * arrowTypes.length)];
        }

        const isLongArrow = currentLevel !== 'easy' && Math.random() < 0.2;
        const isDoubleArrow = currentLevel === 'hard' && Math.random() < 0.3;

        const spawnSingleArrow = (type) => {
            const newArrow = document.createElement('div');
            newArrow.classList.add('falling-arrow', type);
            newArrow.dataset.arrowType = type;
            if (isLongArrow) {
                newArrow.classList.add('long');
                newArrow.dataset.duration = '1000';
            }
            newArrow.style.top = isLongArrow ? '-200px' : '-70px';
            const targetArrow = document.querySelector(`.arrow-target.${type}`);
            newArrow.style.left = targetArrow ? `${targetArrow.offsetLeft}px` : '0px';
            gamePlayArea.appendChild(newArrow);
        };

        spawnSingleArrow(arrowType);
        if (isDoubleArrow) {
            const secondType = arrowTypes[(arrowTypes.indexOf(arrowType) + 1) % arrowTypes.length];
            spawnSingleArrow(secondType);
        }
    };

    const showFeedback = (message, type) => {
        feedbackMessage.textContent = message;
        feedbackMessage.className = type;
        feedbackMessage.style.animation = 'none';
        feedbackMessage.offsetHeight;
        feedbackMessage.style.animation = null;
    };

    document.addEventListener('keydown', (event) => {
        if (!gameActive || controlMode !== 'pc') return;
        const mappedKey = customKeyMap[event.code];
        if (['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight'].includes(mappedKey)) {
            event.preventDefault();
            handleInput(mappedKey, 'keydown');
        }
    });

    document.addEventListener('keyup', (event) => {
        if (controlMode !== 'pc') return;
        const mappedKey = customKeyMap[event.code];
        if (['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight'].includes(mappedKey)) {
            const targetArrow = document.querySelector(`.arrow-target.${mappedKey.replace('Arrow', '').toLowerCase()}`);
            if (targetArrow) targetArrow.classList.remove('pressed');
            handleInputRelease(mappedKey);
        }
    });

    targetArrowsContainer.addEventListener('touchstart', (event) => {
        if (!gameActive || controlMode !== 'android') return;
        event.preventDefault();
        Array.from(event.changedTouches).forEach(touch => {
            const touchedElement = document.elementFromPoint(touch.clientX, touch.clientY);
            if (touchedElement && touchedElement.classList.contains('arrow-target')) {
                const arrowType = touchedElement.classList[1];
                touchedElement.classList.add('pressed');
                touchedElement.dataset.activeTouchId = touch.identifier;
                handleInput(`Arrow${arrowType.charAt(0).toUpperCase() + arrowType.slice(1)}`, 'touchstart', touch.identifier);
            }
        });
    });

    targetArrowsContainer.addEventListener('touchend', (event) => {
        if (controlMode !== 'android') return;
        Array.from(event.changedTouches).forEach(touch => {
            const targetArrow = document.querySelector(`.arrow-target[data-active-touch-id="${touch.identifier}"]`);
            if (targetArrow) {
                targetArrow.classList.remove('pressed');
                delete targetArrow.dataset.activeTouchId;
                const arrowType = targetArrow.classList[1];
                handleInputRelease(`Arrow${arrowType.charAt(0).toUpperCase() + arrowType.slice(1)}`, touch.identifier);
            }
        });
    });

    const handleInput = (arrowDirection, inputType, touchId = null) => {
        const directionClass = arrowDirection.replace('Arrow', '').toLowerCase();
        const targetArrowElement = document.querySelector(`.arrow-target.${directionClass}`);
        if (targetArrowElement) targetArrowElement.classList.add('pressed');
        const fallingArrows = document.querySelectorAll(`.falling-arrow.${directionClass}:not(.hit)`);
        let hitArrow = null;
        let minDistance = Infinity;
        const hitZoneCenter = targetY + (targetHeight / 2);
        fallingArrows.forEach(arrow => {
            const arrowCenterY = parseFloat(arrow.style.top) + (arrow.classList.contains('long') ? 100 : 35);
            const distance = Math.abs(arrowCenterY - hitZoneCenter);
            if (distance <= hitTolerance && !arrow.classList.contains('hit')) {
                if (distance < minDistance) {
                    minDistance = distance;
                    hitArrow = arrow;
                }
            }
        });
        if (hitArrow) {
            if (hitArrow.classList.contains('long')) {
                if (!activeHoldArrow || activeHoldArrow === hitArrow) {
                    activeHoldArrow = hitArrow;
                    hitArrow.classList.add('hold');
                    const duration = parseInt(hitArrow.dataset.duration);
                    holdStartTime = Date.now();
                    holdIntervalId = setInterval(() => {
                        if (!gameActive || !activeHoldArrow) {
                            clearInterval(holdIntervalId);
                            holdIntervalId = null;
                            return;
                        }
                        const elapsed = Date.now() - holdStartTime;
                        if (elapsed >= duration) {
                            clearInterval(holdIntervalId);
                            holdIntervalId = null;
                            activeHoldArrow.classList.add('hit');
                            setTimeout(() => activeHoldArrow.remove(), 100);
                            activeHoldArrow = null;
                            score += 2000;
                            scoreDisplay.textContent = `Puntuación: ${score}`;
                            showFeedback('¡Perfect Hold!', 'perfect-hold');
                            perfectSound.play().catch(() => console.error('Error al reproducir perfectSound'));
                        } else {
                            score += 50;
                            scoreDisplay.textContent = `Puntuación: ${score}`;
                            hitArrow.style.opacity = 0.5 - (elapsed / duration) * 0.3;
                        }
                    }, 100);
                }
            } else {
                hitArrow.classList.add('hit');
                setTimeout(() => hitArrow.remove(), 100);
                if (minDistance <= hitTolerance / 3) {
                    score += 1000;
                    showFeedback('¡PERFECTO!', 'perfect');
                    perfectSound.play().catch(() => console.error('Error al reproducir perfectSound'));
                } else {
                    score += 500;
                    showFeedback('¡BIEN!', 'good');
                    perfectSound.play().catch(() => console.error('Error al reproducir perfectSound'));
                }
            }
        }
        scoreDisplay.textContent = `Puntuación: ${score}`;
    };

    const handleInputRelease = (arrowDirection, touchId = null) => {
        const directionClass = arrowDirection.replace('Arrow', '').toLowerCase();
        if (activeHoldArrow && activeHoldArrow.classList.contains(directionClass)) {
            if (holdIntervalId) {
                clearInterval(holdIntervalId);
                holdIntervalId = null;
            }
            const elapsed = Date.now() - holdStartTime;
            const duration = parseInt(activeHoldArrow.dataset.duration);
            if (elapsed < duration * 0.7) {
                activeHoldArrow.classList.add('hit');
                setTimeout(() => activeHoldArrow.remove(), 100);
                score -= 100;
                scoreDisplay.textContent = `Puntuación: ${score}`;
                showFeedback('¡FALLO!', 'bad');
                missSound.play().catch(() => console.error('Error al reproducir missSound'));
            } else {
                activeHoldArrow.classList.add('hit');
                setTimeout(() => activeHoldArrow.remove(), 100);
                score += 1000;
                scoreDisplay.textContent = `Puntuación: ${score}`;
                showFeedback('¡Hold Good!', 'good-hold');
                perfectSound.play().catch(() => console.error('Error al reproducir perfectSound'));
            }
            activeHoldArrow = null;
            holdStartTime = null;
        }
    };

    const togglePause = () => {
        if (gameActive) pauseGame();
        else resumeGame();
    };

    const openSettingsModal = () => {
        lastScreenBeforeSettings = startScreen.classList.contains('active') ? startScreen :
                                  levelSelectScreen.classList.contains('active') ? levelSelectScreen :
                                  gameScreen.classList.contains('active') ? gameScreen : startScreen;
        if (lastScreenBeforeSettings === gameScreen) pauseGame();
        showScreen(settingsModalOverlay);
        updateControlModeUI();
        updateMusicSelectionUI();
        updateBackgroundSelectionUI();
        updateBackgroundVideoSelectionUI();
        populateKeyMappingTable();
        populateGamepadMappingTable();
        checkGamepadStatus();
    };

    const closeSettingsModal = () => {
        settingsModalOverlay.style.display = 'none';
        cleanupEventListeners();
        showScreen(lastScreenBeforeSettings || startScreen);
        if (lastScreenBeforeSettings === gameScreen && !gameActive) {
            startGameOverlayButton.style.display = 'block';
            pauseButton.style.display = 'flex';
            pauseButton.textContent = '▶';
        }
    };

    const backToMainMenu = () => {
        closeSettingsModal();
        endGame();
        showScreen(startScreen);
    };

    // Event Listeners
    startButtonMainMenu.addEventListener('click', debounce(() => showScreen(levelSelectScreen), 300));
    controlsButtonMainMenu.addEventListener('click', debounce(openSettingsModal, 300));
    levelEasyButton.addEventListener('click', debounce(() => startGame('easy'), 300));
    levelMediumButton.addEventListener('click', debounce(() => startGame('medium'), 300));
    levelHardButton.addEventListener('click', debounce(() => startGame('hard'), 300));
    backToMenuButton.addEventListener('click', debounce(backToMainMenu, 300));
    settingsButtonGame.addEventListener('click', debounce(openSettingsModal, 300));
    pauseButton.addEventListener('click', debounce(togglePause, 300));
    closeSettingsBtn.addEventListener('click', debounce(closeSettingsModal, 300));
    backToMenuFromSettingsButton.addEventListener('click', debounce(backToMainMenu, 300));

    startGameOverlayButton.addEventListener('click', debounce(() => {
        if (!gameActive) {
            if (backgroundMusic && backgroundMusic.paused) {
                backgroundMusic.play().then(() => {
                    musicHasStartedEver = true;
                    musicDuration = backgroundMusic.duration || 0;
                    musicTimeDisplay.textContent = `0:00 / ${formatTime(musicDuration)}`;
                    musicTimeInterval = setInterval(updateMusicTime, 1000);
                    resumeGame();
                }).catch(e => {
                    console.error("Error al reproducir la música:", e);
                    musicPrompt.textContent = "No se pudo iniciar la música. Intenta recargar o revisar permisos.";
                    musicPrompt.style.display = 'block';
                });
            } else {
                resumeGame();
            }
        }
    }, 300));

    const setControlMode = (mode) => {
        controlMode = mode;
        localStorage.setItem('controlMode', mode);
        updateControlModeUI();
        updateMappingSectionVisibility();
    };

    const setMusicChoice = (music) => {
        musicChoice = music;
        localStorage.setItem('musicChoice', music);
        updateMusicSelectionUI();
        selectedMusicDisplay.textContent = `Música: ${musicOptions[music].name}`;
    };

    const setBackgroundType = (type) => {
        backgroundType = type;
        localStorage.setItem('backgroundType', type);
        updateBackgroundSelectionUI();
        updateBackground();
    };

    const setBackgroundVideoChoice = (video) => {
        backgroundVideoChoice = video;
        localStorage.setItem('backgroundVideoChoice', video);
        updateBackgroundVideoSelectionUI();
        updateBackground();
    };

    const updateControlModeUI = () => {
        [modeAndroidBtn, modePCBtn, modeGamepadBtn].forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === controlMode);
        });
        updateMappingSectionVisibility();
    };

    const updateMusicSelectionUI = () => {
        [musicLamineBtn, musicFeelGoodBtn, musicJungleBtn].forEach(btn => {
            btn.classList.toggle('active', btn.dataset.music === musicChoice);
        });
    };

    const updateBackgroundSelectionUI = () => {
        [bgImageBtn, bgVideoBtn].forEach(btn => {
            btn.classList.toggle('active', btn.dataset.bgType === backgroundType);
        });
    };

    const updateBackgroundVideoSelectionUI = () => {
        [bgVideoFeelGoodBtn, bgVideoJungleBtn].forEach(btn => {
            btn.classList.toggle('active', btn.dataset.video === backgroundVideoChoice);
        });
    };

    const updateMappingSectionVisibility = () => {
        keyMappingSection.classList.toggle('active', controlMode === 'pc');
        gamepadMappingSection.classList.toggle('active', controlMode === 'gamepad');
        noKeyboardMessage.style.display = controlMode === 'pc' && !hasKeyboardBeenPressed ? 'block' : 'none';
        if (controlMode === 'gamepad') checkGamepadStatus();
        else {
            noGamepadMessage.style.display = 'none';
            gamepadConnectedName.style.display = 'none';
        }
    };

    modeAndroidBtn.addEventListener('click', () => setControlMode('android'));
    modePCBtn.addEventListener('click', () => setControlMode('pc'));
    modeGamepadBtn.addEventListener('click', () => setControlMode('gamepad'));
    musicLamineBtn.addEventListener('click', () => setMusicChoice('lamine_yamal'));
    musicFeelGoodBtn.addEventListener('click', () => setMusicChoice('feel_good'));
    musicJungleBtn.addEventListener('click', () => setMusicChoice('jungle'));
    bgImageBtn.addEventListener('click', () => setBackgroundType('image'));
    bgVideoBtn.addEventListener('click', () => setBackgroundType('video'));
    bgVideoFeelGoodBtn.addEventListener('click', () => setBackgroundVideoChoice('feel_good'));
    bgVideoJungleBtn.addEventListener('click', () => setBackgroundVideoChoice('jungle'));

    const populateKeyMappingTable = () => {
        keyMappingTableBody.innerHTML = '';
        const actions = ['left', 'down', 'up', 'right'];
        const validActions = actions.map(a => `Arrow${a.charAt(0).toUpperCase() + a.slice(1)}`);
        const cleanedKeyMap = {};
        Object.entries(customKeyMap).forEach(([key, value]) => {
            if (validActions.includes(value) && !Object.values(cleanedKeyMap).includes(value)) {
                cleanedKeyMap[key] = value;
            }
        });
        customKeyMap = cleanedKeyMap;
        localStorage.setItem('customKeyMap', JSON.stringify(customKeyMap));
        actions.forEach(action => {
            const row = keyMappingTableBody.insertRow();
            row.insertCell(0).textContent = `Flecha ${action.charAt(0).toUpperCase() + action.slice(1)}`;
            const keyCell = row.insertCell(1);
            const input = document.createElement('input');
            input.type = 'text';
            input.readOnly = true;
            input.placeholder = 'Presiona una tecla';
            input.dataset.action = `Arrow${action.charAt(0).toUpperCase() + action.slice(1)}`;
            const foundMapping = Object.entries(customKeyMap).find(([_, value]) => value === input.dataset.action);
            if (foundMapping) input.value = foundMapping[0].replace('Key', '');
            input.addEventListener('focus', () => {
                input.value = 'Presionando...';
                activeKeyMapInput = input;
                document.addEventListener('keydown', captureKeyForMapping, { once: true });
            });
            keyCell.appendChild(input);
        });
    };

    const captureKeyForMapping = (event) => {
        if (!activeKeyMapInput) return;
        event.preventDefault();
        const newKey = event.code;
        activeKeyMapInput.value = newKey.replace('Key', '');
        const actionToMap = activeKeyMapInput.dataset.action;
        for (const key in customKeyMap) {
            if (customKeyMap[key] === actionToMap) delete customKeyMap[key];
        }
        customKeyMap[newKey] = actionToMap;
        localStorage.setItem('customKeyMap', JSON.stringify(customKeyMap));
        activeKeyMapInput.blur();
        activeKeyMapInput = null;
        hasKeyboardBeenPressed = true;
        noKeyboardMessage.style.display = 'none';
    };

    let gamepadPollingInterval;
    let connectedGamepad = null;

    window.addEventListener('gamepadconnected', (event) => {
        connectedGamepad = event.gamepad;
        gamepadConnectedName.textContent = `Mando conectado: ${connectedGamepad.id}`;
        gamepadConnectedName.style.display = 'block';
        noGamepadMessage.style.display = 'none';
        startPollingGamepad();
        if (settingsModalOverlay.style.display === 'flex' && controlMode === 'gamepad') {
            populateGamepadMappingTable();
        }
    });

    window.addEventListener('gamepaddisconnected', () => {
        connectedGamepad = null;
        gamepadConnectedName.style.display = 'none';
        if (settingsModalOverlay.style.display === 'flex' && controlMode === 'gamepad') {
            noGamepadMessage.style.display = 'block';
        }
        stopPollingGamepad();
    });

    const checkGamepadStatus = () => {
        if (!navigator.getGamepads) {
            noGamepadMessage.textContent = 'La API de Gamepad no está soportada en este navegador.';
            noGamepadMessage.style.display = 'block';
            return;
        }
        const gamepads = navigator.getGamepads();
        connectedGamepad = gamepads[0];
        if (connectedGamepad) {
            gamepadConnectedName.textContent = `Mando conectado: ${connectedGamepad.id}`;
            gamepadConnectedName.style.display = 'block';
            noGamepadMessage.style.display = 'none';
            startPollingGamepad();
        } else {
            gamepadConnectedName.style.display = 'none';
            noGamepadMessage.style.display = 'block';
            stopPollingGamepad();
        }
    };

    const startPollingGamepad = () => {
        if (!gamepadPollingInterval) {
            gamepadPollingInterval = setInterval(pollGamepad, 100);
        }
    };

    const stopPollingGamepad = () => {
        if (gamepadPollingInterval) {
            clearInterval(gamepadPollingInterval);
            gamepadPollingInterval = null;
        }
    };

    const pollGamepad = () => {
        if (!connectedGamepad) return;
        const gamepads = navigator.getGamepads();
        connectedGamepad = gamepads[connectedGamepad.index];
        if (!connectedGamepad) {
            stopPollingGamepad();
            return;
        }
        if (activeKeyMapInput && activeKeyMapInput.dataset.action.startsWith('Arrow')) {
            for (let i = 0; i < connectedGamepad.buttons.length; i++) {
                if (connectedGamepad.buttons[i].pressed && !connectedGamepad.buttons[i].lastPressed) {
                    if (activeKeyMapInput.dataset.mappingGamepadCapture !== 'true') {
                        activeKeyMapInput.value = `Botón ${i}`;
                        const actionToMap = activeKeyMapInput.dataset.action;
                        for (const key in customGamepadMap) {
                            if (customGamepadMap[key] === actionToMap) delete customGamepadMap[key];
                        }
                        customGamepadMap[`Button${i}`] = actionToMap;
                        localStorage.setItem('customGamepadMap', JSON.stringify(customGamepadMap));
                        activeKeyMapInput.blur();
                        activeKeyMapInput.dataset.mappingGamepadCapture = 'true';
                        setTimeout(() => {
                            if (activeKeyMapInput) activeKeyMapInput.dataset.mappingGamepadCapture = 'false';
                            activeKeyMapInput = null;
                        }, 50);
                    }
                    return;
                }
            }
            if (activeKeyMapInput && activeKeyMapInput.dataset.mappingGamepadCapture === 'true') {
                if (!connectedGamepad.buttons.some(btn => btn.pressed)) {
                    activeKeyMapInput.dataset.mappingGamepadCapture = 'false';
                }
            }
        }
        if (gameActive && controlMode === 'gamepad') {
            for (let i = 0; i < connectedGamepad.buttons.length; i++) {
                if (connectedGamepad.buttons[i].pressed && !connectedGamepad.buttons[i].lastPressed) {
                    const mappedDirection = customGamepadMap[`Button${i}`];
                    if (mappedDirection) {
                        handleInput(mappedDirection, 'gamepad');
                        const directionClass = mappedDirection.replace('Arrow', '').toLowerCase();
                        const targetArrow = document.querySelector(`.arrow-target.${directionClass}`);
                        if (targetArrow) targetArrow.classList.add('pressed');
                    }
                }
                if (!connectedGamepad.buttons[i].pressed && connectedGamepad.buttons[i].lastPressed) {
                    const mappedDirection = customGamepadMap[`Button${i}`];
                    if (mappedDirection) {
                        const directionClass = mappedDirection.replace('Arrow', '').toLowerCase();
                        const targetArrow = document.querySelector(`.arrow-target.${directionClass}`);
                        if (targetArrow) targetArrow.classList.remove('pressed');
                        handleInputRelease(mappedDirection);
                    }
                }
                connectedGamepad.buttons[i].lastPressed = connectedGamepad.buttons[i].pressed;
            }
        }
    };

    const populateGamepadMappingTable = () => {
        gamepadMappingTableBody.innerHTML = '';
        const actions = ['left', 'down', 'up', 'right'];
        const validActions = actions.map(a => `Arrow${a.charAt(0).toUpperCase() + a.slice(1)}`);
        actions.forEach(action => {
            const row = gamepadMappingTableBody.insertRow();
            row.insertCell(0).textContent = `Flecha ${action.charAt(0).toUpperCase() + action.slice(1)}`;
            const buttonCell = row.insertCell(1);
            const input = document.createElement('input');
            input.type = 'text';
            input.readOnly = true;
            input.placeholder = 'Presiona un botón';
            input.dataset.action = `Arrow${action.charAt(0).toUpperCase() + action.slice(1)}`;
            const foundMapping = Object.entries(customGamepadMap).find(([key, value]) => value === input.dataset.action);
            if (foundMapping) input.value = foundMapping[0].replace('Button', 'Botón ');
            input.addEventListener('focus', () => {
                input.value = 'Presionando...';
                activeKeyMapInput = input;
                input.dataset.mappingGamepadCapture = 'false';
            });
            buttonCell.appendChild(input);
        });
    };

    // Inicialización
    showScreen(startScreen);
    updateControlModeUI();
    updateMusicSelectionUI();
    updateBackgroundSelectionUI();
    updateBackgroundVideoSelectionUI();
    startGameOverlayButton.style.display = 'none';
    musicPrompt.style.display = 'none';
    videoErrorPrompt.style.display = 'none';
    pauseButton.style.display = 'none';
    updateBackground();
});
