
// DOM Elements
const ball = document.getElementById('ball');
const noCupWrapper = document.getElementById('no-cup-wrapper');
const yesCupWrapper = document.getElementById('yes-cup-wrapper');
const gameContainer = document.querySelector('.game-container');
const backgroundHearts = document.getElementById('background-hearts');

// State
let isAnimating = false;
let yesCupScale = 1;
let ballOriginalBottom = 40; // Matches CSS
let ballOriginalLeft = '50%';

// Initialize Floating Hearts
function createFloatingHearts() {
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart-bg');
        heart.innerHTML = '&#10084;';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
        heart.style.animationDelay = Math.random() * 5 + 's';
        heart.style.opacity = Math.random() * 0.5 + 0.1;
        backgroundHearts.appendChild(heart);
    }
}

createFloatingHearts();

// Ball Throw Logic
gameContainer.addEventListener('click', (e) => {
    if (isAnimating) return;

    // Simple verification if click is generally on the bottom half or on the ball
    // For better UX on mobile, any tap executes throw
    throwBall(e.clientX, e.clientY);
});

function throwBall(targetX, targetY) {
    isAnimating = true;

    const ballRect = ball.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();

    // Starting position relative to game container
    const startX = gameRect.width / 2;
    const startY = gameRect.height - 150 + 110; // Approx based on CSS throw-area

    // Determine target based on click, or default to center throw if clicked specifically on ball
    // actually, let's just make the ball fly towards where the user tapped.

    // Check if aiming for NO cup and dodge!
    const noRect = noCupWrapper.getBoundingClientRect();
    const distToNo = Math.hypot(targetX - (noRect.left + noRect.width / 2), targetY - (noRect.top + noRect.height / 2));

    if (distToNo < 100) {
        // Dodging logic triggered!
        const dodgeDirX = (noRect.left + noRect.width / 2) < (gameContainer.getBoundingClientRect().width / 2) ? -1 : 1;
        // Move away from center or towards edge? simpler: move randomly away
        const moveX = (Math.random() > 0.5 ? 100 : -100);
        const moveY = (Math.random() > 0.5 ? -50 : 50);

        noCupWrapper.style.transform = `translate(${moveX}px, ${moveY}px)`;

        // Reset position after a bit?
        setTimeout(() => {
            noCupWrapper.style.transform = `translate(0, 0)`;
        }, 1500);
    }

    ball.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    ball.style.bottom = (gameRect.height - targetY) + 'px';
    ball.style.left = (targetX - gameRect.left) + 'px';
    ball.style.transform = 'translate(-50%, 50%) scale(0.6)'; // Scale down to look further away

    // Check collision/interaction mid-flight or at end
    // For simplicity, we check destination against Cup positions

    setTimeout(() => {
        checkHit(targetX, targetY);
    }, 1000); // Wait for transition animation
}

function checkHit(x, y) {
    // Get Cup Rects
    const noRect = noCupWrapper.getBoundingClientRect();
    const yesRect = yesCupWrapper.getBoundingClientRect();

    // Check collision with NO cup
    // We allow a bit of buffer
    const buffer = 50;

    const distToNo = Math.hypot(x - (noRect.left + noRect.width / 2), y - (noRect.top + noRect.height / 2));
    const distToYes = Math.hypot(x - (yesRect.left + yesRect.width / 2), y - (yesRect.top + yesRect.height / 2));

    if (distToNo < buffer + 40) {
        // Hit No Cup? Wait.. No cup should have dodged!
        // But if we managed to hit it (unlikely with logic below), or missed.
        resetBall();
        growYesCup(); // Punish 'No' attempts by making 'Yes' bigger anyway? Or just reset.
        // Let's make Yes grow to encourage it.
    } else if (distToYes < buffer + 40 * yesCupScale) { // Larger hit area for larger cup
        // Hit YES Cup!
        celebrate();
    } else {
        // Missed everything
        resetBall();
        // Maybe grow Yes cup slightly on miss to keep game progressing
        growYesCup();
    }
}

function resetBall() {
    ball.style.transition = 'none';
    ball.style.bottom = '40px';
    ball.style.left = '50%';
    ball.style.transform = 'translate(-50%) scale(1)';
    isAnimating = false;
}

// "No" Cup Dodging Logic
// Track mouse/touch to move No cup away before click, or during flight?
// User asked: "when the moves close to the no cup move the direct of the cup"
// Interpreting as: When ball gets close, move cup.
// Since we have a determined flight path on click, we can predict hits.
// However, continuous movement is funnier. Let's make it run away from mouse/pointer first.

document.addEventListener('mousemove', (e) => {
    moveNoCupAway(e.clientX, e.clientY);
});

// Also on touch move
document.addEventListener('touchmove', (e) => {
    moveNoCupAway(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });


function moveNoCupAway(mouseX, mouseY) {
    const rect = noCupWrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dist = Math.hypot(mouseX - centerX, mouseY - centerY);

    // If pointer is close (e.g. 150px), move away
    if (dist < 150) {
        // Calculate vector away from mouse
        const dx = centerX - mouseX;
        const dy = centerY - mouseY;

        // Move by some factor
        // Limit movement so it doesn't go off screen totally or overlap Yes cup too much
        const moveX = (dx / dist) * 50;
        const moveY = (dy / dist) * 50;

        noCupWrapper.style.transform = `translate(${moveX}px, ${moveY}px)`;
    } else {
        // Return to original? Or stay? 
        // User said "move the direct of the cup so ball doesn't fall into the cup" (sic)
        // Let's keep it jumpy.
        noCupWrapper.style.transform = `translate(0, 0)`;
    }
}


function growYesCup() {
    yesCupScale += 0.2;
    yesCupWrapper.style.transform = `scale(${yesCupScale})`;
}


function celebrate() {
    // Confetti time!
    // Simple JS confetti or visual cue

    const h1 = document.querySelector('header h1');
    h1.innerHTML = "Yay! Happy Valentine's Day! ❤️";
    h1.style.fontSize = "3rem";

    // Change image to the success one
    const image = document.querySelector('.heart-shaped-image');
    if (image) {
        image.src = "success.jpg"; // User needs to provide this or I'll use a placeholder if missing
        image.onerror = function () {
            this.src = "https://placehold.co/180x180/ffd700/ffffff?text=Love+Wins!";
        };
    }

    yesCupWrapper.style.transform = `scale(${yesCupScale + 0.5}) rotate(10deg)`;

    // Simple confetti
    for (let i = 0; i < 100; i++) {
        createConfetti();
    }
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.innerHTML = ['❤️', '💖', '💘', '💝'][Math.floor(Math.random() * 4)];
    confetti.style.position = 'absolute';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.fontSize = Math.random() * 20 + 10 + 'px';
    confetti.style.zIndex = 1000;
    confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
    document.body.appendChild(confetti);
}

// Add simple fall animation for confetti
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes fall {
    to { transform: translateY(100vh) rotate(720deg); }
}`;
document.head.appendChild(styleSheet);
