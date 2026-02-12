// Initialize configuration
const config = window.VALENTINE_CONFIG;

// Validate configuration
function validateConfig() {
    const warnings = [];

    // Check required fields
    if (!config.valentineName) {
        warnings.push("Valentine's name is not set! Using default.");
        config.valentineName = "My Love";
    }

    // Validate colors
    const isValidHex = (hex) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    Object.entries(config.colors).forEach(([key, value]) => {
        if (!isValidHex(value)) {
            warnings.push(`Invalid color for ${key}! Using default.`);
            config.colors[key] = getDefaultColor(key);
        }
    });

    // Validate animation values
    if (parseFloat(config.animations.floatDuration) < 5) {
        warnings.push("Float duration too short! Setting to 5s minimum.");
        config.animations.floatDuration = "5s";
    }

    if (config.animations.heartExplosionSize < 1 || config.animations.heartExplosionSize > 3) {
        warnings.push("Heart explosion size should be between 1 and 3! Using default.");
        config.animations.heartExplosionSize = 1.5;
    }

    // Log warnings if any
    if (warnings.length > 0) {
        console.warn("⚠️ Configuration Warnings:");
        warnings.forEach(warning => console.warn("- " + warning));
    }
}

// Default color values
function getDefaultColor(key) {
    const defaults = {
        backgroundStart: "#ffafbd",
        backgroundEnd: "#ffc3a0",
        buttonBackground: "#ff6b6b",
        buttonHover: "#ff8787",
        textColor: "#ff4757"
    };
    return defaults[key];
}

// Set page title
document.title = config.pageTitle;

// ----------------------------
// Helpers
// ----------------------------

// Function to show next question
function showNextQuestion(questionNumber) {
    document.querySelectorAll('.question-section').forEach(q => q.classList.add('hidden'));
    const next = document.getElementById(`question${questionNumber}`);
    if (next) next.classList.remove('hidden');
}

// Function to move the "No" button when clicked/hovered
function moveButton(button) {
    const x = Math.random() * (window.innerWidth - button.offsetWidth);
    const y = Math.random() * (window.innerHeight - button.offsetHeight);
    button.style.position = 'fixed';
    button.style.left = x + 'px';
    button.style.top = y + 'px';
}

// Create floating hearts and bears
function createFloatingElements() {
    const container = document.querySelector('.floating-elements');
    if (!container) return;

    // Create hearts
    config.floatingEmojis.hearts.forEach(heart => {
        const div = document.createElement('div');
        div.className = 'heart';
        div.innerHTML = heart;
        setRandomPosition(div);
        container.appendChild(div);
    });

    // Create bears
    config.floatingEmojis.bears.forEach(bear => {
        const div = document.createElement('div');
        div.className = 'bear';
        div.innerHTML = bear;
        setRandomPosition(div);
        container.appendChild(div);
    });
}

// Set random position for floating elements
function setRandomPosition(element) {
    element.style.left = Math.random() * 100 + 'vw';
    element.style.animationDelay = Math.random() * 5 + 's';
    element.style.animationDuration = 10 + Math.random() * 20 + 's';
}

// Celebration function
function celebrate() {
    document.querySelectorAll('.question-section').forEach(q => q.classList.add('hidden'));
    const celebrationEl = document.getElementById('celebration');
    if (!celebrationEl) return;

    celebrationEl.classList.remove('hidden');

    // Set celebration messages
    const t = document.getElementById('celebrationTitle');
    const m = document.getElementById('celebrationMessage');
    const e = document.getElementById('celebrationEmojis');

    if (t) t.textContent = config.celebration.title;
    if (m) m.textContent = config.celebration.message;
    if (e) e.textContent = config.celebration.emojis;

    // Create heart explosion effect
    createHeartExplosion();
}

// Create heart explosion animation
function createHeartExplosion() {
    const container = document.querySelector('.floating-elements');
    if (!container) return;

    for (let i = 0; i < 50; i++) {
        const heart = document.createElement('div');
        const randomHeart = config.floatingEmojis.hearts[Math.floor(Math.random() * config.floatingEmojis.hearts.length)];
        heart.innerHTML = randomHeart;
        heart.className = 'heart';
        container.appendChild(heart);
        setRandomPosition(heart);
    }
}

// ----------------------------
// Love meter functionality
// ----------------------------
let loveMeter, loveValue, extraLove;

function setInitialPosition() {
    if (!loveMeter || !loveValue) return;
    loveMeter.value = 100;
    loveValue.textContent = 100;
    loveMeter.style.width = '100%';
}

function wireLoveMeter() {
    loveMeter = document.getElementById('loveMeter');
    loveValue = document.getElementById('loveValue');
    extraLove = document.getElementById('extraLove');

    if (!loveMeter || !loveValue || !extraLove) return;

    setInitialPosition();

    loveMeter.addEventListener('input', () => {
        const value = parseInt(loveMeter.value);
        loveValue.textContent = value;

        if (value > 100) {
            extraLove.classList.remove('hidden');
            const overflowPercentage = (value - 100) / 9900;
            const extraWidth = overflowPercentage * window.innerWidth * 0.8;
            loveMeter.style.width = `calc(100% + ${extraWidth}px)`;
            loveMeter.style.transition = 'width 0.3s';

            // Show different messages based on the value
            if (value >= 5000) {
                extraLove.classList.add('super-love');
                extraLove.textContent = config.loveMessages.extreme;
            } else if (value > 1000) {
                extraLove.classList.remove('super-love');
                extraLove.textContent = config.loveMessages.high;
            } else {
                extraLove.classList.remove('super-love');
                extraLove.textContent = config.loveMessages.normal;
            }
        } else {
            extraLove.classList.add('hidden');
            extraLove.classList.remove('super-love');
            loveMeter.style.width = '100%';
        }
    });

    // Keep it sane on reloads / layout changes
    window.addEventListener('load', setInitialPosition);
}

// ----------------------------
// Music Player Setup
// ----------------------------
function setupMusicPlayer() {
    const musicControls = document.getElementById('musicControls');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    const musicSource = document.getElementById('musicSource');

    if (!musicControls || !musicToggle || !bgMusic || !musicSource) return;

    // Only show controls if music is enabled in config
    if (!config.music.enabled) {
        musicControls.style.display = 'none';
        return;
    }

    // Set music source and volume
    musicSource.src = config.music.musicUrl;
    bgMusic.volume = config.music.volume || 0.5;
    bgMusic.load();

    // Set initial button text
    musicToggle.textContent = config.music.startText;

    // Try autoplay if enabled
    if (config.music.autoplay) {
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                console.log("Autoplay prevented by browser");
                musicToggle.textContent = config.music.startText;
            });
        }
    }

    // Toggle music on button click
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.textContent = config.music.stopText;
        } else {
            bgMusic.pause();
            musicToggle.textContent = config.music.startText;
        }
    });
}

// ----------------------------
// Main init
// ----------------------------
window.addEventListener('DOMContentLoaded', () => {
    // Validate configuration first
    validateConfig();

    // Set texts from config
    const titleEl = document.getElementById('valentineTitle');
    if (titleEl) titleEl.textContent = `${config.valentineName}, my love...`;

    // Set first question texts
    const q1 = document.getElementById('question1Text');
    const yes1 = document.getElementById('yesBtn1');
    const no1 = document.getElementById('noBtn1');
    const secret = document.getElementById('secretAnswerBtn');

    if (q1) q1.textContent = config.questions.first.text;
    if (yes1) yes1.textContent = config.questions.first.yesBtn;
    if (no1) no1.textContent = config.questions.first.noBtn;
    if (secret) secret.textContent = config.questions.first.secretAnswer;

    // Set second question texts
    const q2 = document.getElementById('question2Text');
    const startText = document.getElementById('startText');
    const nextBtn = document.getElementById('nextBtn');

    if (q2) q2.textContent = config.questions.second.text;
    if (startText) startText.textContent = config.questions.second.startText;
    if (nextBtn) nextBtn.textContent = config.questions.second.nextBtn;

    // Set third question texts
    const q3 = document.getElementById('question3Text');
    const yes3 = document.getElementById('yesBtn3');
    const no3 = document.getElementById('noBtn3');

    if (q3) q3.textContent = config.questions.third.text;
    if (yes3) yes3.textContent = config.questions.third.yesBtn;
    if (no3) no3.textContent = config.questions.third.noBtn;

    // Create initial floating elements
    createFloatingElements();

    // Setup music player
    setupMusicPlayer();

    // Setup love meter
    wireLoveMeter();

    // ✅ Wire up button actions (THIS FIXES YOUR FLOW)

    // Q1: Yes -> go to Q2
    if (yes1) {
        yes1.addEventListener('click', () => showNextQuestion(2));
    }

    // Q1: No -> run away
    if (no1) {
        no1.addEventListener('mouseenter', (e) => moveButton(e.target));
        no1.addEventListener('click', (e) => moveButton(e.target));
    }

    // Q2: Next -> go to Q3
    if (nextBtn) {
        nextBtn.addEventListener('click', () => showNextQuestion(3));
    }

    // Q3: Yes -> celebrate
    if (yes3) {
        yes3.addEventListener('click', () => celebrate());
    }

    // Q3: No -> run away
    if (no3) {
        no3.addEventListener('mouseenter', (e) => moveButton(e.target));
        no3.addEventListener('click', (e) => moveButton(e.target));
    }
});
