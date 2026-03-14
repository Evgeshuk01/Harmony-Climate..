// ================= INDEX PAGE SCRIPTS =================

// Функція для отримання популярних товарів
// Завантажити товари з localStorage або використовувати дані з data.js
function loadProductsFromStorage() {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    try {
      const parsed = JSON.parse(savedProducts);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Замінити PRODUCTS на збережені дані
        PRODUCTS.splice(0, PRODUCTS.length, ...parsed);
      }
    } catch (e) {
      console.error('Помилка при завантаженні товарів:', e);
    }
  }
}

function loadPopularProducts() {
  const popularIds = [1, 3, 5]; // IDs популярних товарів
  const container = document.getElementById('popularProducts');

  if (!container) return;

  container.innerHTML = '';

  popularIds.forEach(id => {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.imageUrl || product.image}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
      <h4 style="margin: 10px 0 5px;">${product.name}</h4>
      <p class="muted" style="font-size: 12px; margin: 5px 0;">${product.description}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <strong style="font-size: 18px; color: #c9a24d;">${product.price.toLocaleString('uk-UA')} грн</strong>
        <button onclick="addToCart({...PRODUCTS.find(p => p.id === ${product.id})}, ${product.id})"
          style="padding: 8px 12px; background: #c9a24d; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
          В кошик
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Функція для добавлення в кошик
function addToCart(product, productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingProduct = cart.find(item => item.id === productId);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();

  // Уведомлення
  const msg = document.createElement('div');
  msg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #c9a24d;
    color: #000;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 1000;
    font-weight: 600;
  `;
  msg.textContent = '✓ Добавлено в кошик!';
  document.body.appendChild(msg);

  setTimeout(() => msg.remove(), 2000);
}

// Функція для оновлення бейджа кошика
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = totalItems;
  }
}

// Часті питання (FAQ)
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });
}

// Форма консультації
function initConsultationForm() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Тут можна додати відправку на сервер
    console.log('Дані форми консультації:', data);

    // Показуємо повідомлення про успіх
    showNotification('✅ Дякуємо! Ми зв\'яжемося з вами протягом години.', 'success');

    // Очищаємо форму
    form.reset();
  });
}

// Універсальна функція для повідомлень
function showNotification(message, type = 'info') {
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    info: '#c9a24d'
  };

  const msg = document.createElement('div');
  msg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: ${type === 'success' ? '#fff' : '#000'};
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 1000;
    font-weight: 600;
    max-width: 300px;
  `;
  msg.textContent = message;
  document.body.appendChild(msg);

  setTimeout(() => msg.remove(), 4000);
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  loadProductsFromStorage();
  loadPopularProducts();
  updateCartBadge();
  initFAQ();
  initConsultationForm();
  initScrollAnimations();
});

// Анімації появи при прокрутці
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Додаємо анімації до секцій
  const sections = document.querySelectorAll('section:not(.hero)');
  sections.forEach(section => {
    section.classList.add('fade-in-section');
    observer.observe(section);
  });

  // Анімації для карток
  const cards = document.querySelectorAll('.benefit, .review-card, .blog-card, .contact-card');
  cards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });
}