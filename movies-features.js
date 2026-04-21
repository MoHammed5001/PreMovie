/* ============================================================
   MOVIES PAGE (index.html) — Play Overlay + Video Modal
   Vanilla JS — paste before </body> in index.html
   ============================================================ */

(function initMoviesPage() {

  /* ──────────────────────────────────────────────
     1.  PLAY ICON OVERLAY on every movie/browse card
     Injects a .pm-play-overlay div into every card
     image wrapper that doesn't already have one.
     ────────────────────────────────────────────── */

  const cardImgSelectors = [
    '.movie-card-img',
    '.browse-card-img',
    '.related-img',
    '.hero-poster-placeholder',
  ];

  cardImgSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (el.querySelector('.pm-play-overlay')) return; // avoid duplicates
      const overlay = document.createElement('div');
      overlay.className = 'pm-play-overlay';
      overlay.innerHTML = `
        <div class="pm-play-circle">
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      `;
      el.appendChild(overlay);
    });
  });


  /* ──────────────────────────────────────────────
     2.  VIDEO MODAL
     Opens when any card (movie/browse/related) is
     clicked. Uses the Avatar trailer YouTube embed
     as the default source. You can override by
     adding data-video-id="YOUTUBE_ID" on the card.
     ────────────────────────────────────────────── */

  const AVATAR_TRAILER_ID = 'cRdxXPV9GNQ'; // Avatar Official Trailer (YouTube)

  /* Build modal HTML once */
  const modal = document.createElement('div');
  modal.id        = 'pm-video-modal';
  modal.className = 'pm-video-modal';
  modal.innerHTML = `
    <div class="pm-video-backdrop"></div>
    <div class="pm-video-container">
      <button class="pm-video-close" id="pm-video-close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
          <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/>
        </svg>
      </button>
      <div class="pm-video-title-bar" id="pm-video-title-bar">
        <span id="pm-video-title-text">Avatar</span>
        <span class="pm-video-year">2009</span>
      </div>
      <div class="pm-video-frame-wrap">
        <iframe
          id="pm-video-iframe"
          src=""
          frameborder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const iframe    = modal.querySelector('#pm-video-iframe');
  const closeBtn  = modal.querySelector('#pm-video-close');
  const backdrop  = modal.querySelector('.pm-video-backdrop');
  const titleText = modal.querySelector('#pm-video-title-text');

  /* Open modal */
  function openModal(title, videoId) {
    titleText.textContent = title || 'Avatar';
    iframe.src = `https://www.youtube.com/embed/${videoId || AVATAR_TRAILER_ID}?autoplay=1&rel=0`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* Close modal — clear iframe src to stop playback */
  function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });


  /* Attach click to all clickable card wrappers */
  const clickTargets = [
    '.movie-card',
    '.browse-card',
    '.related-card',
  ];

  clickTargets.forEach(sel => {
    document.querySelectorAll(sel).forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', e => {
        // Don't fire if heart button was clicked
        if (e.target.closest('.heart-btn')) return;

        const titleEl = card.querySelector(
          '.movie-card-title, .browse-card-title, .related-title'
        );
        const title   = titleEl ? titleEl.textContent.trim() : 'Movie';
        const videoId = card.dataset.videoId || AVATAR_TRAILER_ID;
        openModal(title, videoId);
      });
    });
  });

  /* Also hook the "Watching now" hero button */
  document.querySelectorAll('.btn-primary').forEach(btn => {
    if (btn.textContent.includes('Watching')) {
      btn.addEventListener('click', () => openModal('Avatar', AVATAR_TRAILER_ID));
    }
  });

})();
