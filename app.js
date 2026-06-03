/* ==========================================
   Sri Lanka Tour JS Logic (Refined)
   Chamila Tours Interactive Portal
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- STATE VARIABLES ---
  let activeTheme = 'light';
  
  // Lightbox Carousel State
  let galleryImages = [];
  let currentImageIndex = 0;

  // --- THEME MANAGEMENT ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    activeTheme = theme;
    localStorage.setItem('ceylon-tour-theme', theme);
    
    // Update button icon
    const icon = themeToggleBtn.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
      themeToggleBtn.style.color = 'var(--gold)';
    } else {
      icon.className = 'fa-solid fa-moon';
      themeToggleBtn.style.color = '';
    }
  };

  // Load saved theme
  const savedTheme = localStorage.getItem('ceylon-tour-theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }

  // Toggle Theme Listener
  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  });

  // --- REAL GEOGRAPHICAL LEAFLET MAP ---
  
  // Coordinates mapping for each Day Highlight
  const regionCoordinates = {
    1: { lat: 6.8724, lng: 81.0475, name: "Ella", label: "Day 1: Ella highlands" },
    2: { lat: 6.9897, lng: 80.4906, name: "Ginigathhena", label: "Day 2: Ginigathhena treehouse stay" },
    3: { lat: 6.9707, lng: 80.7829, name: "Nuwara Eliya", label: "Day 3: Nuwara Eliya (Little England)" },
    4: { lat: 8.0372, lng: 80.7513, name: "Habarana", label: "Day 4: Ancient cities & Cave temples" },
    5: { lat: 7.9570, lng: 80.7600, name: "Sigiriya", label: "Day 5: Sigiriya citadel climbing" },
    6: { lat: 8.0372, lng: 80.7513, name: "Habarana Lake", label: "Day 6: Elephant safari & Lake ride" },
    7: { lat: 7.2089, lng: 79.8353, name: "Negombo", label: "Day 7: Negombo coastal lagoons" },
    8: { lat: 7.1802, lng: 79.8837, name: "Colombo Airport (CMB)", label: "Day 8: Departure transfer" }
  };

  // Route coordinate list (drawing the driving path)
  const routePoints = [
    [6.4385, 79.9996], // Aluthgama (Start)
    [6.2778, 81.2858], // Yala
    [6.8724, 81.0475], // Ella
    [6.9897, 80.4906], // Ginigathhena
    [6.9707, 80.7829], // Nuwara Eliya
    [7.2513, 80.3464], // Pinnawala (en route)
    [7.1972, 80.5786], // Ambuluwawa (en route)
    [7.8742, 80.6517], // Dambulla (en route)
    [8.0372, 80.7513], // Habarana
    [7.9570, 80.7600], // Sigiriya
    [7.5255, 80.6234], // Matale (en route)
    [7.2089, 79.8353], // Negombo
    [7.1802, 79.8837]  // Airport
  ];

  // Initialize Map
  const map = L.map('map', {
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: false
  }).setView([7.30, 80.65], 8); // Centered on Sri Lanka

  // Add CartoDB Positron Tile Layer (Light, clean style that filters well in CSS for dark mode)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18
  }).addTo(map);

  // Custom marker icon creation helper (creates CSS circle pins matching theme)
  const createCustomIcon = (dayNum, status = 'default') => {
    let colorClass = 'default';
    if (status === 'active') colorClass = 'active';
    else if (status === 'completed') colorClass = 'completed';

    return L.divIcon({
      className: `custom-map-icon ${colorClass}`,
      html: `<div class="map-pin-inner">${dayNum}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  // Add driving route polyline
  const polyline = L.polyline(routePoints, {
    color: 'var(--accent)',
    weight: 3.5,
    opacity: 0.6,
    dashArray: '5, 8'
  }).addTo(map);

  // Track map markers to update their styles dynamically
  const markers = {};

  // Plot markers for each day highlight
  Object.keys(regionCoordinates).forEach(dayKey => {
    const data = regionCoordinates[dayKey];
    const marker = L.marker([data.lat, data.lng], {
      icon: createCustomIcon(dayKey, 'default')
    }).addTo(map);

    // Bind clean styled popup
    marker.bindPopup(`
      <div class="map-popup-header">${data.name}</div>
      <div class="map-popup-desc">${data.label}</div>
    `);

    markers[dayKey] = marker;
  });

  // --- SCROLLSPY & MAP INTEGRATION ---
  const dayCards = document.querySelectorAll('.day-card');
  const navLinks = document.querySelectorAll('.nav-link');

  let lastHighlightedDay = 0;

  const updateActiveHighlights = () => {
    let currentDayId = 'day1';
    let currentDayNum = 1;
    
    // Determine active day section on scroll
    dayCards.forEach(card => {
      const cardTop = card.offsetTop;
      if (window.scrollY >= cardTop - 250) {
        currentDayId = card.getAttribute('id');
        currentDayNum = parseInt(card.getAttribute('data-day'));
      }
    });

    // Update Sticky Navigation Tabs
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentDayId}`) {
        link.classList.add('active');
        link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        link.classList.remove('active');
      }
    });

    // Update Day Cards highlight borders
    dayCards.forEach(card => {
      if (card.getAttribute('id') === currentDayId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Update Sidebar Label
    const activeLabel = document.getElementById('active-day-label');
    if (activeLabel) {
      activeLabel.innerText = `Day ${currentDayNum} Stop`;
    }

    // Dynamic Leaflet Map updates (Only trigger changes when active day actually changes to prevent jitter)
    if (currentDayNum !== lastHighlightedDay) {
      lastHighlightedDay = currentDayNum;

      // Reset all marker states, then apply active or completed styles
      Object.keys(markers).forEach(dayKey => {
        const marker = markers[dayKey];
        const day = parseInt(dayKey);

        if (day === currentDayNum) {
          marker.setIcon(createCustomIcon(dayKey, 'active'));
          // Pan map to marker and open popup
          map.panTo([regionCoordinates[day].lat, regionCoordinates[day].lng], {
            animate: true,
            duration: 0.6
          });
          marker.openPopup();
        } else if (day < currentDayNum) {
          marker.setIcon(createCustomIcon(dayKey, 'completed'));
        } else {
          marker.setIcon(createCustomIcon(dayKey, 'default'));
        }
      });
    }
  };

  // Add scroll listener
  window.addEventListener('scroll', () => {
    // 1. Scroll progress line
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressEl = document.getElementById('scroll-progress');
    if (progressEl) {
      progressEl.style.width = scrolled + '%';
    }

    // 2. Scrollspy
    updateActiveHighlights();
  });

  // Run scrollspy on load
  setTimeout(() => {
    updateActiveHighlights();
    map.invalidateSize(); // Fixes Leaflet tile loading inside initially hidden/rendered flexible divs
  }, 100);

  // --- FILTERS & LIVE SEARCH ---
  const searchInput = document.getElementById('attraction-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const filterPills = document.querySelectorAll('.pill');
  const attractionCards = document.querySelectorAll('.attraction-card');

  let activeFilter = 'all';
  let activeSearchQuery = '';

  const filterCards = () => {
    attractionCards.forEach(card => {
      const tags = card.getAttribute('data-tags') || '';
      const name = card.querySelector('h4').innerText.toLowerCase();
      const desc = card.querySelector('p').innerText.toLowerCase();
      
      const matchesFilter = activeFilter === 'all' || tags.includes(activeFilter);
      const matchesSearch = name.includes(activeSearchQuery) || desc.includes(activeSearchQuery);
      
      if (matchesFilter && matchesSearch) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  };

  // Filter Pill clicks
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-filter');
      filterCards();
    });
  });

  // Search input typing
  searchInput.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value.trim().toLowerCase();
    
    // Toggle clear button
    if (activeSearchQuery.length > 0) {
      clearSearchBtn.style.display = 'block';
    } else {
      clearSearchBtn.style.display = 'none';
    }
    
    filterCards();
  });

  // Clear search click
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    activeSearchQuery = '';
    clearSearchBtn.style.display = 'none';
    filterCards();
    searchInput.focus();
  });

  // --- LIGHTBOX IMAGE CAROUSEL POPUP ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxTag = document.getElementById('lightbox-tag');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxCounter = document.getElementById('lightbox-counter');

  // Open Lightbox with Carousel
  attractionCards.forEach(card => {
    card.addEventListener('click', () => {
      // Read data attributes
      const imagesString = card.getAttribute('data-images') || '';
      galleryImages = imagesString.split(',').map(url => url.trim()).filter(url => url.length > 0);
      
      const title = card.querySelector('h4').innerText;
      const tag = card.querySelector('.card-badge').innerText;
      const desc = card.querySelector('p').innerText;

      // Reset carousel index
      currentImageIndex = 0;
      
      // Update Captions
      lightboxTitle.innerText = title;
      lightboxTag.innerText = tag;
      lightboxDesc.innerText = desc;

      // Update Gallery View
      updateLightboxImage();

      // Show Lightbox Modal
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scroll
    });
  });

  // Update Lightbox view based on current index
  const updateLightboxImage = () => {
    if (galleryImages.length === 0) return;
    
    // Fade out transition trigger
    lightboxImg.style.opacity = '0.3';
    
    setTimeout(() => {
      lightboxImg.setAttribute('src', galleryImages[currentImageIndex]);
      lightboxImg.style.opacity = '1';
    }, 150);

    // Update Image Counter
    lightboxCounter.innerText = `${currentImageIndex + 1} / ${galleryImages.length}`;

    // Hide navigation arrows if only 1 image exists
    if (galleryImages.length <= 1) {
      lightboxPrev.style.display = 'none';
      lightboxNext.style.display = 'none';
      lightboxCounter.style.display = 'none';
    } else {
      lightboxPrev.style.display = 'flex';
      lightboxNext.style.display = 'flex';
      lightboxCounter.style.display = 'inline-block';
    }
  };

  // Next Slide
  const nextSlide = (e) => {
    if (e) e.stopPropagation();
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
  };

  // Prev Slide
  const prevSlide = (e) => {
    if (e) e.stopPropagation();
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  };

  // Nav Arrow Event Listeners
  lightboxNext.addEventListener('click', nextSlide);
  lightboxPrev.addEventListener('click', prevSlide);

  // Close Lightbox
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  lightboxClose.addEventListener('click', closeLightbox);
  
  // Close when clicking outside content container
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-modal')) {
      closeLightbox();
    }
  });

  // Keyboard navigation support (Esc, Left arrow, Right arrow)
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight' && galleryImages.length > 1) nextSlide();
      else if (e.key === 'ArrowLeft' && galleryImages.length > 1) prevSlide();
    }
  });

});
