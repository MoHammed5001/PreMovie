(function initUltimateMovieSystem() {
    const style = document.createElement('style');
    style.textContent = `
        .pm-play-overlay {
            position: absolute; inset: 0;
            display: flex; align-items: center; justify-content: center;
            background: rgba(124, 58, 237, 0.2);
            opacity: 0; transition: 0.4s; z-index: 5;
            pointer-events: none;
        }
        [class*="-card"]:hover .pm-play-overlay, 
        [class*="-img"]:hover .pm-play-overlay { opacity: 1; }

        .pm-play-circle {
            width: 50px; height: 50px; background: #7c3aed;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: white; box-shadow: 0 0 20px rgba(124, 58, 237, 0.6);
            transform: scale(0.8); transition: 0.3s;
        }
        [class*="-card"]:hover .pm-play-circle { transform: scale(1); }

        .pm-video-modal { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; z-index: 10000; opacity: 0; transition: 0.3s; }
        .pm-video-modal.open { display: flex; opacity: 1; }
        .pm-video-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); cursor: pointer; }
        .pm-video-container { position: relative; width: 90%; max-width: 900px; background: #0b0b12; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px rgba(124,58,237,0.5); }
        .pm-video-frame-wrap { position: relative; padding-bottom: 56.25%; height: 0; }
        .pm-video-frame-wrap iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .pm-video-close { position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 24px; cursor: pointer; z-index: 11; width: 40px; height: 40px; border-radius: 50%; }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.className = 'pm-video-modal';
    modal.innerHTML = `
        <div class="pm-video-backdrop"></div>
        <div class="pm-video-container">
            <button class="pm-video-close">&times;</button>
            <div class="pm-video-frame-wrap">
                <iframe id="pm-video-iframe" src="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const iframe = modal.querySelector('#pm-video-iframe');

    function getYoutubeId(url) {
        if (!url) return 'cRdxXPV9GNQ'; // فيديو افتراضي
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : 'cRdxXPV9GNQ';
    }

    function openModal(url) {
        const videoId = getYoutubeId(url);
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        iframe.src = '';
        document.body.style.overflow = '';
    }

    const selectors = ['.movie-card-img', '.browse-card-img', '.related-img', '.hero-poster-placeholder'];
    
    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            if (!el.querySelector('.pm-play-overlay')) {
                el.style.position = 'relative'; 
                const overlay = document.createElement('div');
                overlay.className = 'pm-play-overlay';
                overlay.innerHTML = `<div class="pm-play-circle"><svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M8 5v14l11-7z"/></svg></div>`;
                el.appendChild(overlay);
            }
        });
    });
    document.querySelectorAll('.movie-card, .browse-card, .related-card, [class*="-img"]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.closest('.heart-btn')) return;
            const videoUrl = card.dataset.videoId || card.getAttribute('data-url');
            openModal(videoUrl);
        });
    });
    document.querySelectorAll('button, .btn').forEach(btn => {
        if (btn.textContent.toLowerCase().includes('watching') || btn.id === 'playBtn') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(btn.getAttribute('data-url'));
            });
        }
    });
    modal.querySelector('.pm-video-close').onclick = closeModal;
    modal.querySelector('.pm-video-backdrop').onclick = closeModal;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

})();