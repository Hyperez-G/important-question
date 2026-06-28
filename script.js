document.addEventListener('DOMContentLoaded', () => {
  const particlesContainer = document.getElementById('particles');
  const noBtn = document.getElementById('no-btn');
  const yesBtn = document.getElementById('yes-btn');
  const successModal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const currentDateEl = document.getElementById('current-date');
  const introScreen  = document.getElementById('intro-screen');
  const startScreen  = document.getElementById('start-screen');
  const cardContainer = document.querySelector('.card-container');
  const bgMusic       = document.getElementById('bg-music');

  const card = document.getElementById('love-card');
  const buttonWrapper = document.querySelector('.button-wrapper');

  // Set current date on the letter
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  currentDateEl.innerText = new Date().toLocaleDateString('en-US', options);

  // ── Start Screen → Intro → Card ────────────────────────────────
  startScreen.addEventListener('click', () => {
    // 1. Fade out start screen
    startScreen.classList.add('fade-out');

    setTimeout(() => {
      startScreen.style.display = 'none';

      // 2. Start intro animations
      introScreen.classList.add('playing');
      // 3. Fade out intro after shimmer shines
      setTimeout(() => {
        introScreen.classList.add('fade-out');
      }, 2500);

      // 4. Reveal card
      setTimeout(() => {
        introScreen.style.display = 'none';
        cardContainer.classList.add('revealed');
      }, 3300);

    }, 1000); // wait for start screen fade
  }, { once: true });


  // 1. Generate ambient floating particles (hearts and circles)
  const particleTypes = ['circle', 'heart'];
  
  function createParticle(burst = false) {
    const particle = document.createElement('div');
    const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    
    if (type === 'heart') {
      particle.className = 'particle-heart';
      particle.innerHTML = '♥';
      const size = Math.random() * 15 + 10;
      particle.style.fontSize = `${size}px`;
    } else {
      particle.className = 'particle';
      const size = Math.random() * 6 + 3;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
    }

    // Horizontal placement
    const startX = Math.random() * 100;
    particle.style.left = `${startX}%`;

    // Speed and delay
    const duration = burst ? (Math.random() * 3 + 2) : (Math.random() * 5 + 5);
    const delay = burst ? 0 : (Math.random() * 4);
    
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    // Special behavior if part of a success celebration burst
    if (burst) {
      particle.style.bottom = '0px';
      // Calculate random trajectories
      const moveX = (Math.random() - 0.5) * 60;
      particle.style.transform = `translateX(${moveX}vw)`;
      // Fast fade out
      particle.style.opacity = Math.random() * 0.7 + 0.3;
    }

    particlesContainer.appendChild(particle);

    // Remove particle after animation completes
    setTimeout(() => {
      particle.remove();
    }, (duration + delay) * 1000);
  }

  // Create initial ambient particles
  for (let i = 0; i < 20; i++) {
    createParticle();
  }

  // Continuously spawn ambient particles
  setInterval(() => {
    if (particlesContainer.childElementCount < 30) {
      createParticle();
    }
  }, 800);

  // Celebration burst when clicking YES
  function triggerCelebration() {
    for (let i = 0; i < 50; i++) {
      createParticle(true);
    }
  }

  // 2. "No" Button escape logic
  function moveNoButton(event) {
    // If it's the first hover, initialize absolute coords to match current flow offset
    if (!noBtn.classList.contains('running')) {
      const btnRect = noBtn.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const initialLeft = btnRect.left - cardRect.left;
      const initialTop = btnRect.top - cardRect.top;

      // Position absolute at its exact starting position
      noBtn.style.left = `${initialLeft}px`;
      noBtn.style.top = `${initialTop}px`;
      noBtn.classList.add('running');
      card.appendChild(noBtn);

      // Force a DOM reflow so the browser registers the initial coordinates
      noBtn.offsetHeight;

      // Trigger the slide on the next screen frame
      setTimeout(() => {
        calculateAndSetNewCoords(event);
      }, 20);
    } else {
      calculateAndSetNewCoords(event);
    }
  }

  function calculateAndSetNewCoords(event) {
    const padding = 20; // safe cushion inside card
    const cardWidth = card.clientWidth;
    const cardHeight = card.clientHeight;
    
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    
    // Bounds inside the card
    const maxX = cardWidth - btnWidth - padding;
    const maxY = cardHeight - btnHeight - padding;

    // Calculate a random target position within the card container
    let newX = Math.random() * (maxX - padding) + padding;
    let newY = Math.random() * (maxY - padding) + padding;

    // Make sure it doesn't spawn exactly under the user cursor/finger
    let clientX, clientY;
    if (event && event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event) {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    if (event) {
      const cardRect = card.getBoundingClientRect();
      const cursorX = clientX - cardRect.left;
      const cursorY = clientY - cardRect.top;

      // Recalculate distance if it overlaps target within the card
      const distanceThreshold = 75;
      let attempts = 0;
      while (
        Math.abs(newX - cursorX) < distanceThreshold &&
        Math.abs(newY - cursorY) < distanceThreshold &&
        attempts < 10
      ) {
        newX = Math.random() * (maxX - padding) + padding;
        newY = Math.random() * (maxY - padding) + padding;
        attempts++;
      }
    }

    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
  }

  // Mouse hover event listeners
  noBtn.addEventListener('mouseover', moveNoButton);
  noBtn.addEventListener('mouseenter', moveNoButton);
  
  // Mobile touch event listeners to handle mobile users
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents clicking the button on touch release
    moveNoButton(e);
  });

  // Prevent users from clicking with keyboard tab navigation
  noBtn.addEventListener('focus', () => {
    noBtn.blur();
  });

  // If they somehow managed to click, move it first (fallback)
  noBtn.addEventListener('click', (e) => {
    moveNoButton(e);
  });

  // 3. "Yes" Button Modal trigger
  yesBtn.addEventListener('click', () => {
    triggerCelebration();
    // Delay modal active slightly to allow transition animations
    setTimeout(() => {
      successModal.classList.add('active');
    }, 150);

    // Play background music on repeat
    bgMusic.loop = true;
    bgMusic.play().catch(() => {});
  });

  // 4. Modal Close Close overlay
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
      
      // Reset "No" button position back into visual grid
      noBtn.classList.remove('running');
      noBtn.style.position = '';
      noBtn.style.left = '';
      noBtn.style.top = '';
      buttonWrapper.appendChild(noBtn);
    });
  }

  // Reset positioning when resizing window to avoid clipping issues
  window.addEventListener('resize', () => {
    if (noBtn.classList.contains('running')) {
      noBtn.classList.remove('running');
      noBtn.style.position = '';
      noBtn.style.left = '';
      noBtn.style.top = '';
      buttonWrapper.appendChild(noBtn);
    }
  });

});
