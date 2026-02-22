// --- 0. ACTIVITY TRACKER SYSTEM (THE SPY CODE) ---
// This function sends data to your 'logger.php' file
async function logActivity(eventType) {
    try {
        // 1. Get Location Data (Free IP API)
        // Note: Adblockers might block this, which is normal.
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        
        const locationString = `${ipData.city}, ${ipData.country_name}`;
        
        // 2. Prepare the data payload
        const payload = {
            event: eventType,
            location: locationString || "Unknown Location",
            device: navigator.userAgent, // Tells you if they are on iPhone/Android
            screen: `${window.screen.width}x${window.screen.height}`,
            timestamp: new Date().toISOString()
        };

        // 3. Send to your backend (logger.php)
        await fetch('logger.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

    } catch (error) {
        console.log("Tracking silently failed (likely adblocker). Continuing...");
    }
}

// TRACK: Immediately when the page loads
logActivity("Page Load");


// --- 1. INITIAL SETUP ---
gsap.registerPlugin(ScrollTrigger, Draggable);

// ELEMENTS
const yesBtn = document.getElementById('btn-yes');
const noBtn = document.getElementById('btn-no');
const viewIntro = document.getElementById('scene-intro');
const viewCelebration = document.getElementById('scene-celebration');
const musicBtn = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');


// --- 2. WHALE JUMP ANIMATION ---
function initWhaleJump() {
    const whale = document.querySelector('.jumping-whale-sprite');
    const splashLeft = document.querySelector('.splash-left');
    const splashRight = document.querySelector('.splash-right');
    const oceanWidth = document.querySelector('.ocean-stage').offsetWidth;

    // Loop whale jump every 4 seconds
    const jumpTl = gsap.timeline({ repeat: -1, repeatDelay: 4 });

    // Reset position
    jumpTl.set(whale, { x: -200, y: 100, rotation: -45, opacity: 1 });

    // Splash Left
    jumpTl.call(() => {
        splashLeft.style.left = "10%";
        splashLeft.classList.remove('splash-active');
        void splashLeft.offsetWidth; // Trigger reflow
        splashLeft.classList.add('splash-active');
    }, null, 0);

    // Jump Arc
    jumpTl.to(whale, {
        duration: 3,
        x: oceanWidth + 200,
        ease: "power1.in",
        keyframes: {
            y: [0, -350, 0, 100], 
            rotation: [-45, 0, 45, 90],
            ease: "power1.inOut"
        }
    }, 0);

    // Splash Right
    jumpTl.call(() => {
        splashRight.style.left = "90%";
        splashRight.classList.remove('splash-active');
        void splashRight.offsetWidth;
        splashRight.classList.add('splash-active');
    }, null, 2.5);
}
initWhaleJump();


// --- 3. NO BUTTON LOGIC ---
const noBtnRect = noBtn.getBoundingClientRect();
noBtn.addEventListener('mouseenter', () => {
    
    // TRACKING: Log if she tries to click NO (only once)
    if(!noBtn.getAttribute('data-logged')) {
        logActivity("Tried Clicking No");
        noBtn.setAttribute('data-logged', 'true');
    }

    // Move button away randomly
    const randomX = (Math.random() - 0.5) * 300;
    const randomY = (Math.random() - 0.5) * 300;
    
    gsap.to(noBtn, { 
        x: randomX, 
        y: randomY, 
        duration: 0.4, 
        ease: "power2.out" 
    });
    
    // Make Yes button grow slightly to encourage clicking it
    gsap.to(yesBtn, { scale: 1.1, duration: 0.3 });
});


// --- 4. YES BUTTON TRANSITION ---
yesBtn.addEventListener('click', () => {
    
    // TRACKING: The most important log!
    logActivity("Clicked Yes");

    // Play Audio (Browsers require interaction first)
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("User must interact first for audio"));
    
    // Switch icon to Pause
    musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

    // 1. Confetti Explosion
    confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 }, 
        colors: ['#D4AF37', '#A61C1C'] 
    });

    const tl = gsap.timeline();

    // 2. Hide Intro Elements
    tl.to(['.title-main', '.whale-container', '#btn-no', '.gold-orb', '.ocean-stage'], { 
        opacity: 0, 
        duration: 0.5 
    })
      
    // 3. Expand Yes Button to fill screen
    .to(yesBtn, { 
        scale: 50, 
        duration: 1.5, 
        ease: "power2.inOut",
        onComplete: () => {
            // Hide Intro Section
            viewIntro.style.display = 'none';
            // Show Celebration Section
            viewCelebration.style.display = 'block';
            window.scrollTo(0,0);
        }
    })
      
    // 4. Reveal Celebration Content
    .to('#scene-celebration', { opacity: 1, duration: 1 })
    .to('.rose-container', { 
        onStart: () => { document.querySelector('.rose-container').classList.add('blooming'); } 
    })
    .from('.main-card', { y: 100, opacity: 0, duration: 1, ease: "power2.out" });
});


// --- 5. DRAGGABLE POLAROIDS ---
Draggable.create(".polaroid", {
    type: "x,y",
    edgeResistance: 0.65,
    bounds: ".polaroid-wrapper",
    inertia: true,
    onDragStart: function() { 
        gsap.to(this.target, { scale: 1.1, zIndex: 100, duration: 0.2 }); 
    },
    onDragEnd: function() { 
        gsap.to(this.target, { scale: 1, duration: 0.2 }); 
    }
});


// --- 6. COMPLIMENT GENERATOR ---
const compliments = [
    "Your style is effortlessly elegant.",
    "You have a mind that is both brilliant and kind.",
    "The way you handle challenges is inspiring.",
    "You bring a warm energy into every room.",
    "You are stronger than you realize.",
    "Cats probably like you because you are a good person."
];
const compBtn = document.getElementById('compliment-btn');
const compText = document.getElementById('compliment-text');

compBtn.addEventListener('click', () => {
    // Fade out text
    gsap.to(compText, { 
        opacity: 0, 
        y: -20, 
        duration: 0.2, 
        onComplete: () => {
            // Change text
            const random = Math.floor(Math.random() * compliments.length);
            compText.innerText = compliments[random];
            // Fade in text
            gsap.to(compText, { opacity: 1, y: 0, duration: 0.5 });
        }
    });
});


// --- 7. MUSIC TOGGLE BUTTON ---
musicBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        bgMusic.pause();
        musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>';
    }
});