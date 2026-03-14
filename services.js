// ================= SERVICES PAGE SCRIPTS =================

// Форма замовлення послуг
function initServiceOrderForm() {
  const form = document.getElementById('serviceOrderForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Тут можна додати відправку на сервер
    console.log('Дані форми замовлення послуг:', data);

    // Показуємо повідомлення про успіх
    showNotification('✅ Дякуємо! Наш менеджер зв\'яжеться з вами протягом години.', 'success');

    // Очищаємо форму
    form.reset();
  });
}

// FAQ функціонал
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      item.classList.toggle('active');
    });
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
  const sections = document.querySelectorAll('section:not(.services-hero)');
  sections.forEach(section => {
    section.classList.add('fade-in-section');
    observer.observe(section);
  });

  // Анімації для карток
  const cards = document.querySelectorAll('.card, .gallery-item');
  cards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  initServiceOrderForm();
  initFAQ();
  initScrollAnimations();
});