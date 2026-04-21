(function initCounters() {
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    if (el._counted) return;   
    el._counted = true;

    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
    const duration = 2200;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const value    = Math.floor(eased * target);

      el.innerHTML = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // animate each counter inside the observed element
      entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
      // also animate if the element itself is a counter
      if (entry.target.hasAttribute('data-count')) animateCounter(entry.target);
    });
  }, { threshold: 0.3 });

  // Observe every counter + their parent containers
  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
  document.querySelectorAll('.hero-stats, .stats-section, .stats-grid').forEach(el => observer.observe(el));
})();
(function initComments() {
  const container = document.getElementById('comments-section');
  if (!container) return;

  const seed = [
    { id: 1,  author: 'Alex Rivera',   avatar: 'AR', text: 'One of the most visually stunning films ever made. James Cameron really outdid himself!', likes: 142, time: Date.now() - 3600000 * 5,  replies: [] },
    { id: 2,  author: 'Priya Nair',    avatar: 'PN', text: "The world-building on Pandora is just breathtaking. Every frame looks like a painting.", likes: 87,  time: Date.now() - 3600000 * 12, replies: [] },
    { id: 3,  author: 'Marcus Dunn',   avatar: 'MD', text: 'Watched it in 3D back in 2009 and nothing has matched that experience since. A true event film.', likes: 63,  time: Date.now() - 86400000 * 2,  replies: [] },
    { id: 4,  author: 'Sofia Chen',    avatar: 'SC', text: "Great visuals but I wish the story had more depth. Still worth watching on a big screen!", likes: 31,  time: Date.now() - 86400000 * 5,  replies: [] },
  ];

  let comments = JSON.parse(localStorage.getItem('pm_comments') || 'null') || seed;
  let nextId    = Math.max(...comments.map(c => c.id)) + 1;

  function save() { localStorage.setItem('pm_comments', JSON.stringify(comments)); }

  function relativeTime(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function avatarColor(name) {
    const palette = ['#7c3aed','#9333ea','#c026d3','#0891b2','#059669','#d97706','#dc2626'];
    let hash = 0;
    for (const c of name) hash = (hash << 5) - hash + c.charCodeAt(0);
    return palette[Math.abs(hash) % palette.length];
  }

  /* ── render ── */
  function render() {
    container.innerHTML = `
      <div class="pm-comments">
        <div class="pm-comments-header">
          <h2 class="pm-comments-title">
            <span class="pm-icon">💬</span>
            Community Reviews
            <span class="pm-count-badge">${comments.length}</span>
          </h2>
        </div>

        <!-- New comment form -->
        <div class="pm-comment-form">
          <div class="pm-avatar" style="background:var(--purple)">YOU</div>
          <div class="pm-form-body">
            <textarea id="pm-new-text" class="pm-textarea" placeholder="Share your thoughts about this film…" rows="3"></textarea>
            <div class="pm-form-footer">
              <span class="pm-char-count" id="pm-char-count">0 / 500</span>
              <button class="pm-submit-btn" id="pm-submit">Post Review</button>
            </div>
          </div>
        </div>

        <!-- Sort bar -->
        <div class="pm-sort-bar">
          <span class="pm-sort-label">Sort by:</span>
          <button class="pm-sort-btn active" data-sort="top">👍 Top</button>
          <button class="pm-sort-btn" data-sort="new">🕒 Newest</button>
          <button class="pm-sort-btn" data-sort="old">📅 Oldest</button>
        </div>

        <!-- Comment list -->
        <div class="pm-list" id="pm-list"></div>
      </div>
    `;

    renderList('top');
    bindEvents();
  }

  function renderList(sort) {
    const list = document.getElementById('pm-list');
    let sorted = [...comments];
    if (sort === 'top') sorted.sort((a, b) => b.likes - a.likes);
    if (sort === 'new') sorted.sort((a, b) => b.time - a.time);
    if (sort === 'old') sorted.sort((a, b) => a.time - b.time);

    list.innerHTML = sorted.map(c => `
      <div class="pm-comment" data-id="${c.id}">
        <div class="pm-avatar" style="background:${avatarColor(c.author)}">${c.avatar}</div>
        <div class="pm-comment-body">
          <div class="pm-comment-head">
            <strong>${c.author}</strong>
            <span class="pm-time">${relativeTime(c.time)}</span>
          </div>
          <p class="pm-comment-text">${escapeHtml(c.text)}</p>
          <div class="pm-comment-actions">
            <button class="pm-action-btn pm-like-btn ${c._liked ? 'active' : ''}" data-id="${c.id}">
              👍 <span>${c.likes}</span>
            </button>
            <button class="pm-action-btn pm-dislike-btn ${c._disliked ? 'active' : ''}" data-id="${c.id}">
              👎
            </button>
            <button class="pm-action-btn pm-reply-toggle" data-id="${c.id}">
              💬 Reply
            </button>
          </div>
          <div class="pm-reply-form" id="pm-reply-${c.id}" style="display:none">
            <textarea class="pm-textarea pm-reply-text" data-id="${c.id}" placeholder="Write a reply…" rows="2"></textarea>
            <button class="pm-submit-btn pm-submit-reply" data-id="${c.id}">Reply</button>
          </div>
          ${c.replies && c.replies.length ? `
            <div class="pm-replies">
              ${c.replies.map(r => `
                <div class="pm-reply">
                  <div class="pm-avatar pm-avatar-sm" style="background:${avatarColor(r.author)}">${r.avatar}</div>
                  <div class="pm-reply-body">
                    <strong>${r.author}</strong>
                    <span class="pm-time">${relativeTime(r.time)}</span>
                    <p>${escapeHtml(r.text)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function bindEvents() {
    /* char counter */
    const textarea = document.getElementById('pm-new-text');
    const charCount = document.getElementById('pm-char-count');
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} / 500`;
      charCount.style.color = len > 450 ? '#f87171' : '';
    });

    /* submit */
    document.getElementById('pm-submit').addEventListener('click', () => {
      const text = textarea.value.trim();
      if (!text) { textarea.focus(); return; }
      if (text.length > 500) return;

      comments.unshift({
        id: nextId++, author: 'You', avatar: 'YOU',
        text, likes: 0, time: Date.now(), replies: []
      });
      save();
      render();
      showCommentToast('✅ Review posted!');
    });

    /* sort buttons */
    document.querySelectorAll('.pm-sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pm-sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderList(btn.dataset.sort);
        bindListEvents();
      });
    });

    bindListEvents();
  }

  function bindListEvents() {
    /* like */
    document.querySelectorAll('.pm-like-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const c  = comments.find(x => x.id === id);
        if (!c) return;
        if (c._liked) { c.likes--; c._liked = false; }
        else          { c.likes++; c._liked = true; c._disliked = false; }
        save(); renderList(currentSort()); bindListEvents();
      });
    });

    /* dislike */
    document.querySelectorAll('.pm-dislike-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const c  = comments.find(x => x.id === id);
        if (!c) return;
        c._disliked = !c._disliked;
        if (c._disliked) c._liked = false;
        save(); renderList(currentSort()); bindListEvents();
      });
    });

    /* reply toggle */
    document.querySelectorAll('.pm-reply-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const id   = btn.dataset.id;
        const form = document.getElementById(`pm-reply-${id}`);
        const open = form.style.display === 'none';
        form.style.display = open ? 'flex' : 'none';
        if (open) form.querySelector('textarea').focus();
      });
    });

    document.querySelectorAll('.pm-submit-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        const id      = parseInt(btn.dataset.id);
        const form    = document.getElementById(`pm-reply-${id}`);
        const textarea = form.querySelector('textarea');
        const text    = textarea.value.trim();
        if (!text) return;

        const c = comments.find(x => x.id === id);
        if (!c) return;
        c.replies.push({ author: 'You', avatar: 'YOU', text, time: Date.now() });
        save(); renderList(currentSort()); bindListEvents();
        showCommentToast('💬 Reply posted!');
      });
    });
  }

  function currentSort() {
    const active = document.querySelector('.pm-sort-btn.active');
    return active ? active.dataset.sort : 'top';
  }

  function showCommentToast(msg) {
    const t = document.createElement('div');
    t.className = 'pm-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2800);
  }

  render();
})();
