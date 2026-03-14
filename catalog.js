// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
  syncWithAdmin();
  updateCartBadge();
  renderProducts(getProducts());
  attachEventListeners();
  initFooter?.();
});

// ================= HELPERS =================
function getProducts() {
  return window.PRODUCTS || [];
}

// ================= CART BADGE =================
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = total;
}

// ================= SYNC WITH ADMIN =================
function syncWithAdmin() {
  const adminProducts = localStorage.getItem('products');
  if (adminProducts) {
    try {
      window.PRODUCTS = JSON.parse(adminProducts);
    } catch {
      console.warn('Помилка читання products з localStorage');
    }
  }
}

// ================= RENDER PRODUCTS =================
function renderProducts(products = []) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (!products.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-products';
    empty.textContent = 'Товари не знайдені';
    grid.appendChild(empty);
    return;
  }

  products.forEach(product => {
    grid.appendChild(createProductCard(product));
  });
}

// ================= CREATE CARD =================
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const inStockText = product.inStock ? 'В наявності' : 'Немає';

  const stockClass = product.inStock ? 'in-stock' : 'out-of-stock';
  const badgeHTML = product.badge
    ? `<span class="card-badge">${product.badge}</span>`
    : '';

  card.innerHTML = `
    <div class="card-image-container">
      <img src="${product.imageUrl || product.image}" 
           alt="${product.name}" 
           class="card-image"
           loading="lazy">
      ${badgeHTML}
    </div>

    <div class="card-content">
      <h3 class="card-title">${product.name}</h3>
      <p class="card-description">${product.description}</p>

      <div class="card-meta">
        <span class="card-rating">
          ${renderStars(product.rating)} (${product.reviews})
        </span>
        <span class="card-status ${stockClass}">
          ${inStockText}
        </span>
      </div>

      <div class="card-price">
        ${product.price.toLocaleString('uk-UA')} грн
      </div>

      <div class="card-footer">
        <button class="btn-add-cart">Додати</button>
        <button class="btn-view" title="Переглянути деталі">👁️ Деталі</button>
      </div>
    </div>
  `;

  card.querySelector('.btn-add-cart')
      .addEventListener('click', e => {
        e.stopPropagation();
        addToCart(product);
      });

  card.querySelector('.btn-view')
      .addEventListener('click', e => {
        e.stopPropagation();
        openModal(product);
      });

  card.addEventListener('click', () => openModal(product));

  return card;
}

// ================= STARS =================
function renderStars(rating = 0) {
  const full = Math.floor(rating);
  const half = rating % 1 !== 0 ? '½' : '';
  return '★'.repeat(full) + half;
}

// ================= ADD TO CART =================
function addToCart(product) {
  if (!product.inStock) {
    showNotif('Товар не в наявності');
    return;
  }

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || product.image,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showNotif(`${product.name} додано в кошик`);
}

// ================= MODAL =================
function openModal(product) {
  console.log('Відкриваємо модальне вікно для товару:', product.name);
  const modal = document.getElementById('productModal');
  if (!modal) {
    console.error('Модальне вікно не знайдено!');
    return;
  }

  document.getElementById('modalImage').src =
    product.imageUrl || product.image;

  document.getElementById('modalName').textContent =
    product.name;

  document.getElementById('modalDescription').textContent =
    product.fullDescription || product.description;

  document.getElementById('modalPrice').textContent =
    product.price.toLocaleString('uk-UA') + ' грн';

  const colors = { white: 'Білий', black: 'Чорний', gray: 'Сірий' };

  document.getElementById('modalArea').textContent =
    product.area + ' м²';

  document.getElementById('modalWifi').textContent =
    product.wifi === 'yes' ? 'Так' : 'Ні';

  document.getElementById('modalColor').textContent =
    colors[product.color] || product.color;

  document.getElementById('modalPower').textContent =
    product.power + ' кВт';

  document.getElementById('modalNoise').textContent =
    product.noise + ' дБ';

  document.getElementById('modalWarranty').textContent =
    product.warranty;

  document.getElementById('modalDelivery').textContent =
    product.delivery;

  document.getElementById('modalRating').innerHTML = `
    <span class="rating-stars">${renderStars(product.rating)}</span>
    <span class="rating-count">(${product.reviews})</span>
  `;

  const stockText = product.inStock
    ? `В наявності`
    : 'Немає';

  const stockClass = product.inStock ? 'in-stock' : 'out-of-stock';

  document.getElementById('modalStatus').innerHTML =
    `<div class="${stockClass}">${stockText}</div>`;

  const btn = document.getElementById('addToCartBtn');
  btn.disabled = !product.inStock;
  btn.onclick = () => {
    addToCart(product);
    closeModal();
  };

  modal.classList.remove('hidden');
  document.body.classList.add('no-scroll');
}

function closeModal() {
  console.log('Закриваємо модальне вікно');
  const modal = document.getElementById('productModal');
  modal?.classList.add('hidden');
  document.body.classList.remove('no-scroll');
}

// ================= FILTERING =================
function applyFilters() {
  const area = document.getElementById('filter-area')?.value;
  const wifi = document.getElementById('filter-wifi')?.value;
  const color = document.getElementById('filter-color')?.value;
  const price = document.getElementById('filter-price')?.value;
  const search =
    document.getElementById('searchInput')?.value
      .toLowerCase() || '';

  const filtered = getProducts().filter(p => {

    if (area) {
      if (area === '25' && p.area > 25) return false;
      if (area === '40' && p.area > 40) return false;
      if (area === '50' && p.area < 50) return false;
    }

    if (wifi && p.wifi !== wifi) return false;
    if (color && p.color !== color) return false;

    if (price) {
      const pr = p.price;
      if (price === '10000' && pr > 10000) return false;
      if (price === '20000' && (pr <= 10000 || pr > 20000)) return false;
      if (price === '30000' && (pr <= 20000 || pr > 30000)) return false;
      if (price === '50000' && pr <= 30000) return false;
    }

    if (search &&
        !p.name.toLowerCase().includes(search) &&
        !p.description.toLowerCase().includes(search))
      return false;

    return true;
  });

  renderProducts(filtered);
}

// ================= NOTIFICATION =================
function showNotif(message) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = message;

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 3000);
}

// ================= EVENTS =================
function attachEventListeners() {

  ['filter-area','filter-wifi','filter-color','filter-price']
    .forEach(id =>
      document.getElementById(id)
        ?.addEventListener('change', applyFilters)
    );

  document.getElementById('searchBtn')
    ?.addEventListener('click', applyFilters);

  document.getElementById('searchInput')
    ?.addEventListener('keyup', e => {
      if (e.key === 'Enter') applyFilters();
      document.getElementById('clearSearch')
        ?.classList.toggle('hidden', !e.target.value);
    });

  document.getElementById('clearSearch')
    ?.addEventListener('click', () => {
      const input = document.getElementById('searchInput');
      input.value = '';
      applyFilters();
      input.focus();
    });

  document.querySelector('.close-modal')
    ?.addEventListener('click', closeModal);

  document.getElementById('productModal')
    ?.addEventListener('click', e => {
      if (e.target.id === 'productModal') closeModal();
    });

  document.getElementById('closeComparison')
    ?.addEventListener('click', () => {
      document.getElementById('comparisonSection')
        ?.classList.add('hidden');
    });
}
