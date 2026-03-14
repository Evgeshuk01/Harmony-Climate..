// ================= FOOTER ІНЦІАЛІЗАЦІЯ =================
function initFooter() {
  const footer = document.querySelector('footer');
  if (footer) return; // Якщо вже є footer, не додавати

  
// ================= ПОШУК ПО ТОВАРАМ =================
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearSearch');

  if (!searchInput) return;

  function performSearch() {
    const query = searchInput.value.toLowerCase();
    if (!query) {
      filterProducts({ search: '' });
      clearBtn.style.display = 'none';
      return;
    }
    filterProducts({ search: query });
    clearBtn.style.display = 'inline-block';
  }

  searchBtn?.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    filterProducts({ search: '' });
    clearBtn.style.display = 'none';
  });
}

// ================= КАТЕГОРІЇ ТОВАРІВ =================
function initCategories() {
  const categories = [
    { id: 'all', name: '✓ Всі' },
    { id: 'window', name: '🪟 На вікна' },
    { id: 'split', name: '⚙️ Мульти-спліт' },
    { id: 'commercial', name: '🏢 Комерційні' }
  ];

  const container = document.querySelector('.filters');
  if (!container) return;

  const categoriesHtml = `
    <div class="categories-section">
      <div class="categories-list">
        ${categories.map(cat => 
          `<button class="category-btn ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}">${cat.name}</button>`
        ).join('')}
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforebegin', categoriesHtml);

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProducts({ category: btn.dataset.category === 'all' ? '' : btn.dataset.category });
    });
  });
}

// ================= РОЗШИРЕНА ГАЛЕРЕЯ =================
function initGalleryModal() {
  const modal = document.createElement('div');
  modal.className = 'gallery-modal';
  modal.innerHTML = `
    <div class="gallery-modal-content">
      <span class="gallery-close">&times;</span>
      <img id="galleryMainImg" src="" alt="">
      <div class="gallery-thumbs" id="galleryThumbs"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.gallery-close');
  closeBtn.addEventListener('click', () => modal.classList.remove('show'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });

  return { modal, openGallery: openProductGallery };
}

function openProductGallery(mainImage) {
  const modal = document.querySelector('.gallery-modal');
  if (!modal) return;

  // Множина фото для демонстрації (в реальному проекті будуть реальні URL)
  const images = [
    mainImage,
    'https://via.placeholder.com/800x600/1a1a1a/c9a24d?text=Вид+спереду',
    'https://via.placeholder.com/800x600/1a1a1a/c9a24d?text=Вид+збоку',
    'https://via.placeholder.com/800x600/1a1a1a/c9a24d?text=Встановлено',
    'https://via.placeholder.com/800x600/1a1a1a/c9a24d?text=Деталь'
  ];

  const mainImg = modal.querySelector('#galleryMainImg');
  const thumbs = modal.querySelector('#galleryThumbs');

  mainImg.src = images[0];
  thumbs.innerHTML = images.map((img, idx) => 
    `<div class="gallery-thumb" data-idx="${idx}"><img src="${img}" alt=""></div>`
  ).join('');

  thumbs.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      mainImg.src = images[thumb.dataset.idx];
    });
  });

  modal.classList.add('show');
}

// ================= ТЕМА (ТЕМНА/СВІТЛА) =================
function initThemeToggle() {
  const toggle = document.createElement('div');
  toggle.className = 'theme-toggle';
  toggle.innerHTML = '🌙';
  document.body.appendChild(toggle);

  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    toggle.innerHTML = '☀️';
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    toggle.innerHTML = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

// ================= LIVE CHAT =================
function initLiveChat() {
  const widget = document.createElement('div');
  widget.className = 'live-chat-widget';
  widget.innerHTML = `
    <div class="chat-bubble">💬</div>
    <div class="chat-popup">
      <div class="chat-header">Harmony Climate — Підтримка 24/7</div>
      <div class="chat-messages" id="chatMessages">
        <div class="chat-message bot">Привіт! 👋 Як я можу вам допомогти?</div>
      </div>
      <div class="chat-input-area">
        <input type="text" class="chat-input" id="chatInput" placeholder="Ваше питання...">
        <button class="chat-send-btn" id="chatSend">➤</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  const bubble = widget.querySelector('.chat-bubble');
  const popup = widget.querySelector('.chat-popup');
  const input = widget.querySelector('#chatInput');
  const sendBtn = widget.querySelector('#chatSend');
  const messages = widget.querySelector('#chatMessages');

  bubble.addEventListener('click', () => popup.classList.toggle('show'));

  const responses = [
    'Скільки коштує монтаж? Від 2500 до 8000 грн залежно від типу системи.',
    'Яка гарантія? 2 роки на роботи, до 7 років на обладнання з розширеною гарантією.',
    'Як замовити? Виберіть товар у каталозі, додайте в кошик і оформіть замовлення.',
    'Де ви працюєте? По всій Україні з доставкою 1-3 дні.',
    'Які ще питання у вас? Можемо поговорити про конкретні моделі, ціни чи послуги.',
  ];

  function addMessage(text, isUser) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, true);
    input.value = '';

    setTimeout(() => {
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage(response, false);
    }, 300);
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

// ================= NEWSLETTER =================
function initNewsletter() {
  const section = document.querySelector('.newsletter-section');
  if (!section) return;

  const form = section.querySelector('.newsletter-form');
  const input = form?.querySelector('.newsletter-input');
  const btn = form?.querySelector('.newsletter-btn');

  if (!input || !btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!email.includes('@')) {
      alert('Будь ласка, введіть правильний email');
      return;
    }

    localStorage.setItem('subscribedEmail', email);
    alert('✓ Дякуємо за підписку! Ми надішлемо спеціальну пропозицію на вашу пошту.');
    input.value = '';
  });
}

// ================= ANALYTICS =================
function initAnalytics() {
  // Google Analytics (замініть на ваш код)
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'GA_ID');

  // Відслідковування дій
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('hero-btn')) {
      gtag('event', 'button_click', { 'button_name': e.target.textContent });
    }
  });

  // Facebook Pixel (замініть на ваш ID)
  fbq('init', 'FACEBOOK_PIXEL_ID');
  fbq('track', 'PageView');
}

// ================= МОБІЛЬНЕ ДОДАТОК =================
function initPWAInstall() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service Worker не підтримується');
    });
  }

  if (window.BeforeInstallPromptEvent) {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      const installBtn = document.createElement('button');
      installBtn.textContent = '⬇️ Встановити додаток';
      installBtn.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 99;
        padding: 12px 20px;
        background: #c9a24d;
        color: #000;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      `;

      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt = null;
          installBtn.remove();
        }
      });

      document.body.appendChild(installBtn);
    });
  }
}

// ================= МОБІЛЬНЕ МЕНЮ (гамбургер) =================
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  if (!btn || !sidebar) return;

  // Overlay for click outside
  let overlay = document.getElementById('mobileMenuOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobileMenuOverlay';
    overlay.style.cssText = 'position:fixed;inset:60px 0 0 0;z-index:1190;background:rgba(0,0,0,0.45);display:none;';
    document.body.appendChild(overlay);
  }

  function openMenu() {
    sidebar.classList.add('mobile-open');
    overlay.style.display = 'block';
  }

  function closeMenu() {
    sidebar.classList.remove('mobile-open');
    overlay.style.display = 'none';
  }

  btn.addEventListener('click', () => {
    if (sidebar.classList.contains('mobile-open')) closeMenu(); else openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

// ================= ADMIN PANEL =================
function initAdminPanel() {
  const adminBtn = document.createElement('div');
  adminBtn.className = 'admin-btn';
  adminBtn.innerHTML = '⚙️';
  adminBtn.title = 'Панель адміністратора';
  document.body.appendChild(adminBtn);

  const panel = document.createElement('div');
  panel.className = 'admin-panel';
  panel.innerHTML = `
    <span class="admin-close">&times;</span>
    <h3>Панель адміністратора</h3>
    
    <div class="admin-section">
      <h4>📊 Експорт даних</h4>
      <button class="admin-btn-action">📥 Експортувати замовлення (CSV)</button>
      <button class="admin-btn-action">📥 Експортувати контакти</button>
    </div>

    <div class="admin-section">
      <h4>📝 Управління</h4>
      <input type="text" class="admin-input" placeholder="Нова категорія">
      <button class="admin-btn-action">➕ Додати категорію</button>
      <input type="text" class="admin-input" placeholder="Промо-код">
      <input type="number" class="admin-input" placeholder="Знижка (%)">
      <button class="admin-btn-action">➕ Додати промо-код</button>
    </div>

    <div class="admin-section">
      <h4>🔧 Налаштування</h4>
      <button class="admin-btn-action">🔄 Очистити кеш</button>
      <button class="admin-btn-action">📧 Відправити email</button>
    </div>
  `;
  document.body.appendChild(panel);

  adminBtn.addEventListener('click', () => panel.classList.toggle('show'));
  panel.querySelector('.admin-close').addEventListener('click', () => panel.classList.remove('show'));

  // Eksport
  const buttons = panel.querySelectorAll('.admin-btn-action');
  buttons[0].addEventListener('click', () => exportOrders());
  buttons[1].addEventListener('click', () => exportContacts());
  buttons[4].addEventListener('click', () => {
    localStorage.clear();
    location.reload();
  });
}

function exportOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const csv = 'ID,Ім\'я,Email,Сума,Дата\n' + 
    orders.map((o, i) => `${i+1},${o.name},${o.email},${o.total},${o.date}`).join('\n');
  downloadCSV(csv, 'orders.csv');
}

function exportContacts() {
  const emails = new Set();
  Object.keys(localStorage).forEach(key => {
    if (key === 'subscribedEmail') {
      emails.add(localStorage.getItem(key));
    }
  });
  const csv = 'Email\n' + Array.from(emails).join('\n');
  downloadCSV(csv, 'contacts.csv');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

// ================= COLLAPSIBLE SECTIONS FOR MOBILE =================
function initCollapsibles() {
  if (window.innerWidth > 768) return; // only on small screens

  const selectors = ['.gallery', '.popular-products', '.reviews'];
  selectors.forEach(sel => {
    const section = document.querySelector(sel);
    if (!section) return;

    // Avoid double-wrapping
    if (section.dataset.collapsibleInit) return;
    section.dataset.collapsibleInit = '1';

    // Create content wrapper and move children (except first heading/lead)
    const children = Array.from(section.children);
    // Find header (h3 or h2) and lead paragraph
    const header = children.find(c => c.tagName && (c.tagName.toLowerCase() === 'h2' || c.tagName.toLowerCase() === 'h3'));

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'section-content';

    // Move all children except header into contentWrapper
    children.forEach(c => {
      if (c === header) return;
      contentWrapper.appendChild(c);
    });

    // Clear section and re-append header, toggle button, and content
    section.innerHTML = '';
    if (header) section.appendChild(header);

    const toggle = document.createElement('button');
    toggle.className = 'section-toggle';
    toggle.innerHTML = '<span>Показати / Сховати</span><span>▾</span>';
    section.appendChild(toggle);
    section.appendChild(contentWrapper);

    // Start collapsed for very small screens
    section.classList.add('collapsed');

    toggle.addEventListener('click', () => {
      section.classList.toggle('collapsed');
      // adjust max-height for animation
      if (!section.classList.contains('collapsed')) {
        // expand: set max-height to scrollHeight
        contentWrapper.style.maxHeight = contentWrapper.scrollHeight + 'px';
      } else {
        contentWrapper.style.maxHeight = '0px';
      }
    });
  });
}

// ================= BACK TO TOP =================
function initBackToTop() {
  let btn = document.querySelector('.back-to-top');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.title = 'Повернутись вгору';
    btn.innerHTML = '↑';
    document.body.appendChild(btn);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btn.classList.add('show'); else btn.classList.remove('show');
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ================= LAZY LOADING IMAGES =================
function initLazyLoad() {
  const imgs = document.querySelectorAll('img');
  imgs.forEach(img => {
    // add native lazy if supported
    if ('loading' in HTMLImageElement.prototype) {
      img.loading = 'lazy';
    }
    // if data-src present, defer setting src until visible
  });

  // IntersectionObserver for data-src swapping
  const lazyImgs = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window && lazyImgs.length) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const im = entry.target;
          im.src = im.dataset.src;
          im.removeAttribute('data-src');
          observer.unobserve(im);
        }
      });
    }, { rootMargin: '200px' });

    lazyImgs.forEach(i => io.observe(i));
  } else {
    // fallback: load all
    lazyImgs.forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); });
  }
}

// ================= ИНИЦИАЛИЗАЦИЯ =================
document.addEventListener('DOMContentLoaded', () => {
  initFooter();
  initSearch();
  initCategories();
  initGalleryModal();
  initThemeToggle();
  initLiveChat();
  initNewsletter();
  initAnalytics();
  initPWAInstall();
  initAdminPanel();
  initMobileMenu();
  initCollapsibles();
  initBackToTop();
  initLazyLoad();
  initReviews();
});

// ================= РЕЙТИНГ ЗІ ЗІРОЧКАМИ =================
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// ================= РЕЙТИНГ І ВІДГУКИ =================
const REVIEWS = {
  // productId: [{ user, rating, comment, date }, ...]
};
