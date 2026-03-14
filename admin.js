// Перевірка аутентифікації
window.addEventListener('load', () => {
  if (!localStorage.getItem('adminLoggedIn')) {
    window.location.href = 'admin-login.html';
    return;
  }
  
  initDashboard();
  setupTabNavigation();
});

// ТАБЛИЦЯ НАВІГАЦІЇ
function setupTabNavigation() {
  const menuItems = document.querySelectorAll('.admin-menu-item');
  
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      // Видалити активний клас зі всіх
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Приховати всі таби
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Показати обраний таб
      const tabId = item.dataset.tab;
      const tabContent = document.getElementById(tabId);
      if (tabContent) {
        tabContent.classList.add('active');
        
        // Завантажити дані для таба
        if (tabId === 'products') {
          loadProducts();
        } else if (tabId === 'orders') {
          loadOrders();
        } else if (tabId === 'promo') {
          loadPromos();
        } else if (tabId === 'contacts') {
          loadContacts();
        } else if (tabId === 'content') {
          loadContentSettings();
        } else if (tabId === 'analytics') {
          loadAnalytics();
        }
      }
    });
  });
}

// === DASHBOARD ===
function initDashboard() {
  // Завантажити товари з localStorage або з data.js
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
  
  loadDashboardStats();
  loadRecentOrders();
}

function loadDashboardStats() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers')) || [];

  // Загальна кількість товарів
  document.getElementById('totalProducts').textContent = PRODUCTS.length;

  // Кількість замовлень
  document.getElementById('totalOrders').textContent = orders.length;

  // Загальний дохід
  const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
  document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString('uk-UA') + ' грн';

  // Підписники
  document.getElementById('totalSubscribers').textContent = subscribers.length;
}

// Функція для збереження товарів в localStorage
function saveProductsToLocalStorage() {
  try {
    localStorage.setItem('products', JSON.stringify(PRODUCTS));
  } catch (e) {
    console.error('Помилка при збереженні товарів:', e);
    alert('⚠️ Помилка при збереженні товарів');
  }
}

function loadRecentOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const tbody = document.querySelector('#recentOrdersTable tbody');
  tbody.innerHTML = '';

  // Показати останні 5 замовлень
  orders.slice(-5).reverse().forEach((order, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${order.name || 'N/A'}</td>
      <td>${parseFloat(order.total).toLocaleString('uk-UA')} грн</td>
      <td><span style="color: var(--gold);">📦 На обробці</span></td>
      <td>${new Date(order.date).toLocaleDateString('uk-UA')}</td>
    `;
  });

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted);">Замовлень немає</td></tr>';
  }
}

// === ТОВАРИ ===
let editingProductId = null;
let currentProductImage = null;

function previewImage() {
  const fileInput = document.getElementById('productImageInput');
  const file = fileInput.files[0];
  
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    currentProductImage = e.target.result; // Зберегти base64
    
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `<img src="${currentProductImage}" alt="Preview">`;
  };
  
  reader.readAsDataURL(file);
}

function clearImage() {
  currentProductImage = null;
  document.getElementById('productImageInput').value = '';
  document.getElementById('imagePreview').innerHTML = '<div class="no-image">📷</div>';
}

function loadProducts() {
  const tbody = document.querySelector('#productsTable tbody');
  tbody.innerHTML = '';

  PRODUCTS.forEach(product => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><input type="checkbox" class="product-checkbox" data-id="${product.id}"></td>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.price.toLocaleString('uk-UA')} грн</td>
      <td>${product.stock || 'немає'}</td>
      <td><span class="status-${product.inStock ? 'available' : 'unavailable'}">${product.inStock ? '✅ В наявності' : '❌ Немає в наявності'}</span></td>
      <td>
        <button class="btn-small" onclick="editProduct(${product.id})">✏️ Редагувати</button>
        <button class="btn-small btn-delete" onclick="confirmDeleteProduct(${product.id})">🗑️ Видалити</button>
      </td>
    `;
  });

  // Обробка чекбоксів
  document.querySelectorAll('.product-checkbox').forEach(cb => {
    cb.addEventListener('change', updateSelectedCount);
  });

  document.getElementById('selectAll').addEventListener('change', (e) => {
    document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = e.target.checked);
    updateSelectedCount();
  });
}

function updateSelectedCount() {
  const selected = document.querySelectorAll('.product-checkbox:checked');
  const count = selected.length;
  const btn = document.getElementById('deleteSelectedBtn');
  const countEl = document.getElementById('selectedCount');
  
  btn.style.display = count > 0 ? 'inline-block' : 'none';
  countEl.textContent = count > 0 ? `Вибрано: ${count}` : '';
}

function deleteSelectedProducts() {
  const selectedIds = Array.from(document.querySelectorAll('.product-checkbox:checked')).map(cb => parseInt(cb.dataset.id));
  
  if (selectedIds.length === 0) return;
  
  const confirmed = confirm(`Видалити ${selectedIds.length} вибраних товарів?\n\nЦю дію неможливо скасувати!`);
  if (!confirmed) return;
  
  selectedIds.forEach(id => {
    const index = PRODUCTS.findIndex(p => p.id === id);
    if (index > -1) PRODUCTS.splice(index, 1);
  });
  
  saveProductsToLocalStorage();
  alert(`✅ Видалено ${selectedIds.length} товарів`);
  loadProducts();
  loadDashboardStats();
}

function openAddProductModal() {
  editingProductId = null;
  currentProductImage = null;
  document.getElementById('productModalTitle').textContent = '➕ Додати новий товар';
  document.getElementById('productName').value = '';
  document.getElementById('productDesc').value = '';
  document.getElementById('productFullDesc').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '';
  document.getElementById('productRating').value = '';
  document.getElementById('productReviews').value = '';
  document.getElementById('productInStock').checked = true;
  document.getElementById('productImageInput').value = '';
  document.getElementById('imagePreview').innerHTML = '<div class="no-image">📷</div>';
  document.getElementById('productModal').classList.add('show');
}

function editProduct(id) {
  editingProductId = id;
  const product = PRODUCTS.find(p => p.id === id);
  
  if (!product) return;

  currentProductImage = product.imageUrl || null;
  document.getElementById('productModalTitle').textContent = '✏️ Редагувати товар';
  document.getElementById('productName').value = product.name;
  document.getElementById('productDesc').value = product.description;
  document.getElementById('productFullDesc').value = product.fullDescription;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock || '';
  document.getElementById('productRating').value = product.rating;
  document.getElementById('productReviews').value = product.reviews;
  document.getElementById('productInStock').checked = product.inStock !== false; // default true
  document.getElementById('productImageInput').value = '';
  
  // Показати поточне зображення
  const preview = document.getElementById('imagePreview');
  if (currentProductImage) {
    preview.innerHTML = `<img src="${currentProductImage}" alt="Preview">`;
  } else {
    preview.innerHTML = '<div class="no-image">📷</div>';
  }
  
  document.getElementById('productModal').classList.add('show');
}

function saveProduct() {
  const name = document.getElementById('productName').value.trim();
  const desc = document.getElementById('productDesc').value.trim();
  const fullDesc = document.getElementById('productFullDesc').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const stock = parseInt(document.getElementById('productStock').value) || 0;
  const rating = parseFloat(document.getElementById('productRating').value) || 0;
  const reviews = parseInt(document.getElementById('productReviews').value) || 0;
  const inStock = document.getElementById('productInStock').checked;

  // Валідація
  if (!name) {
    alert('❌ Введіть назву товару');
    document.getElementById('productName').focus();
    return;
  }
  if (isNaN(price) || price <= 0) {
    alert('❌ Введіть коректну ціну (більше 0)');
    document.getElementById('productPrice').focus();
    return;
  }
  if (stock < 0) {
    alert('❌ Запас не може бути від\'ємним');
    document.getElementById('productStock').focus();
    return;
  }
  if (rating < 0 || rating > 5) {
    alert('❌ Рейтинг має бути від 0 до 5');
    document.getElementById('productRating').focus();
    return;
  }

  if (editingProductId === null) {
    // Новий товар
    const newId = Math.max(...PRODUCTS.map(p => p.id), 0) + 1;
    const newProduct = {
      id: newId,
      name,
      description: desc,
      fullDescription: fullDesc,
      price,
      stock,
      inStock,
      rating,
      reviews,
      imageUrl: currentProductImage || null, // Зберегти base64 фото
      area: '30-40 м²',
      wifi: '✓',
      color: 'білий',
      image: '🔌',
      badge: null,
      warranty: '5 років',
      delivery: 'завтра',
      power: '2.5 кВт',
      noise: '22 дБ',
      recommendedWith: [],
      features: []
    };
    PRODUCTS.push(newProduct);
    saveProductsToLocalStorage();
    alert('✅ Товар додано успішно. Перезавантажте сторінку каталогу (catalog.html), щоб клієнти побачили зміни.');
  } else {
    // Редагування існуючого
    const product = PRODUCTS.find(p => p.id === editingProductId);
    if (product) {
      product.name = name;
      product.description = desc;
      product.fullDescription = fullDesc;
      product.price = price;
      product.stock = stock;
      product.inStock = inStock;
      product.rating = rating;
      product.reviews = reviews;
      if (currentProductImage) {
        product.imageUrl = currentProductImage; // Оновити фото
      }
      saveProductsToLocalStorage();
      alert('✅ Товар оновлено успішно. Перезавантажте сторінку каталогу (catalog.html), щоб клієнти побачили зміни.');
    }
  }

  closeProductModal();
  loadProducts();
  loadDashboardStats();
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('show');
}

function deleteProduct(id) {
  if (!confirm('❓ Ви впевнені що хочете видалити цей товар?')) return;

  const index = PRODUCTS.findIndex(p => p.id === id);
  if (index > -1) {
    PRODUCTS.splice(index, 1);
    saveProductsToLocalStorage();
    alert('✅ Товар видалено');
    loadProducts();
    loadDashboardStats();
  }
}

function searchProducts() {
  const searchTerm = document.getElementById('productSearch').value.toLowerCase();
  const sortType = document.getElementById('productSort').value;
  const tbody = document.querySelector('#productsTable tbody');
  tbody.innerHTML = '';

  let filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(searchTerm));
  
  // Сортування
  filtered.sort((a, b) => {
    switch (sortType) {
      case 'name':
        return a.name.localeCompare(b.name, 'uk');
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'stock':
        return (b.stock || 0) - (a.stock || 0);
      case 'id':
      default:
        return a.id - b.id;
    }
  });
  
  filtered.forEach(product => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><input type="checkbox" class="product-checkbox" data-id="${product.id}"></td>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.price.toLocaleString('uk-UA')} грн</td>
      <td>${product.stock || 'немає'}</td>
      <td>
        <button class="btn-small" onclick="editProduct(${product.id})">✏️ Редагувати</button>
        <button class="btn-small btn-delete" onclick="confirmDeleteProduct(${product.id})">🗑️ Видалити</button>
      </td>
    `;
  });

  // Оновити чекбокси після пошуку
  document.querySelectorAll('.product-checkbox').forEach(cb => {
    cb.addEventListener('change', updateSelectedCount);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted);">Товари не знайдені</td></tr>';
  }
}

// Окрема функція для сортування без пошуку
function sortProducts() {
  searchProducts(); // Перевикористовуємо
}

// Експорт товарів в JSON
function exportProducts() {
  const data = {
    exportDate: new Date().toLocaleString('uk-UA'),
    products: PRODUCTS
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `products-export-${new Date().getTime()}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
  alert('✅ Товари експортовані');
}

// Імпорт товарів з JSON
function importProducts() {
  document.getElementById('importFile').click();
}

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      if (data.products && Array.isArray(data.products)) {
        // Злиття з існуючими товарами (уникнути дублів по ID)
        const existingIds = new Set(PRODUCTS.map(p => p.id));
        const newProducts = data.products.filter(p => !existingIds.has(p.id));
        
        PRODUCTS.push(...newProducts);
        saveProductsToLocalStorage();
        loadProducts();
        alert(`✅ Імпортовано ${newProducts.length} нових товарів`);
      } else {
        alert('❌ Невірний формат файлу');
      }
    } catch (error) {
      alert('❌ Помилка читання файлу: ' + error.message);
    }
  };
  reader.readAsText(file);
});

// Підтвердження видалення з деталями
function confirmDeleteProduct(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  const confirmed = confirm(`Видалити товар "${product.name}"?\n\nЦіна: ${product.price} грн\nЗапас: ${product.stock || 0}\n\nЦю дію неможливо скасувати!`);
  if (confirmed) {
    deleteProduct(id);
  }
}

// === ЗАМОВЛЕННЯ ===
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  renderOrdersTable(orders);
  attachOrdersEventListeners();
}

function attachOrdersEventListeners() {
  const searchInput = document.getElementById('ordersSearch');
  const statusFilter = document.getElementById('ordersStatusFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterOrders);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', filterOrders);
  }
}

function filterOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const searchInput = document.getElementById('ordersSearch')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('ordersStatusFilter')?.value || '';
  
  const filtered = orders.filter(order => {
    const matchesSearch = !searchInput || 
      order.name?.toLowerCase().includes(searchInput) ||
      order.email?.toLowerCase().includes(searchInput);
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  renderOrdersTable(filtered);
}

function renderOrdersTable(orders) {
  const tbody = document.querySelector('#ordersTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';

  orders.forEach((order, index) => {
    const row = tbody.insertRow();
    const date = new Date(order.date || Date.now()).toLocaleDateString('uk-UA');
    const status = order.status || 'pending';
    
    const statusTexts = {
      'pending': '⏳ Очікує',
      'paid': '✅ Оплачено',
      'shipped': '📦 Доставляється',
      'completed': '✔️ Завершено',
      'cancelled': '❌ Відмінено'
    };
    
    row.innerHTML = `
      <td>#${order.id || index + 1}</td>
      <td>${order.name || 'N/A'}</td>
      <td>${order.email || 'N/A'}</td>
      <td>${parseFloat(order.total).toLocaleString('uk-UA')} грн</td>
      <td><span class="status-badge status-${status}">${statusTexts[status]}</span></td>
      <td>${date}</td>
      <td>
        <button class="btn-small" onclick="viewOrderDetails(${index})">👁️ Переглянути</button>
        <select class="btn-small" style="background: var(--card); color: var(--text);" onchange="updateOrderStatus(${index}, this.value)">
          <option value="">Змінити статус</option>
          <option value="pending">⏳ Очікує</option>
          <option value="paid">✅ Оплачено</option>
          <option value="shipped">📦 Доставляється</option>
          <option value="completed">✔️ Завершено</option>
          <option value="cancelled">❌ Відмінено</option>
        </select>
      </td>
    `;
  });

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--muted);">Замовлень не знайдено</td></tr>';
  }
}

function updateOrderStatus(index, newStatus) {
  if (!newStatus) return;
  
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  if (orders[index]) {
    orders[index].status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrders();
  }
}

function viewOrderDetails(index) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders[index];

  if (!order) return;

  const itemsList = order.items?.map(item => `${item.name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString('uk-UA')} грн`).join('\n');

  alert(`
📋 ДЕТАЛІ ЗАМОВЛЕННЯ #${index + 1}

👤 ІМ'Я: ${order.name}
📧 EMAIL: ${order.email}
📞 ТЕЛЕФОН: ${order.phone}

🏙️ МІСТО: ${order.city}
🏘️ АДРЕСА: ${order.street} ${order.building}${order.apartment ? ', кв. ' + order.apartment : ''}

💳 ПЛАТІЖ: ${order.paymentMethod}
🚚 ДОСТАВКА: ${order.deliveryMethod}

📦 ТОВАРИ:
${itemsList}

💰 РАЗОМ: ${parseFloat(order.total).toLocaleString('uk-UA')} грн

📝 ПРИМІТКА: ${order.notes || 'немає'}
  `);
}

// === ПРОМО-КОДИ ===
let editingPromoCode = null;

function loadPromos() {
  const tbody = document.querySelector('#promosTable tbody');
  tbody.innerHTML = '';

  Object.entries(PROMO_CODES).forEach(([code, promo]) => {
    const row = tbody.insertRow();
    const type = promo.type === 'percent' ? 'Процент' : 'Сума';
    const value = promo.type === 'percent' ? promo.value + '%' : promo.value + ' грн';
    
    row.innerHTML = `
      <td><strong>${code}</strong></td>
      <td>${type}</td>
      <td>${value}</td>
      <td>${promo.minSum?.toLocaleString('uk-UA') || '—'} грн</td>
      <td>
        <button class="btn-small btn-delete" onclick="deletePromo('${code}')">🗑️ Видалити</button>
      </td>
    `;
  });

  if (Object.keys(PROMO_CODES).length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted);">Промо-кодів немає</td></tr>';
  }
}

function openAddPromoModal() {
  editingPromoCode = null;
  document.getElementById('promoCode').value = '';
  document.getElementById('promoType').value = 'percent';
  document.getElementById('promoValue').value = '';
  document.getElementById('promoMinSum').value = '';
  document.getElementById('promoModal').classList.add('show');
}

function savePromo() {
  const code = document.getElementById('promoCode').value.trim().toUpperCase();
  const type = document.getElementById('promoType').value;
  const value = parseFloat(document.getElementById('promoValue').value);
  const minSum = parseFloat(document.getElementById('promoMinSum').value) || 0;

  if (!code || !value) {
    alert('⚠️ Заповніть код та значення');
    return;
  }

  PROMO_CODES[code] = {
    type,
    value,
    minSum
  };

  alert('✅ Промо-код збережено');
  closePromoModal();
  loadPromos();
}

function closePromoModal() {
  document.getElementById('promoModal').classList.remove('show');
}

function deletePromo(code) {
  if (!confirm(`❓ Видалити промо-код "${code}"?`)) return;
  
  delete PROMO_CODES[code];
  alert('✅ Промо-код видалено');
  loadPromos();
}

// === КОНТАКТИ ===
function loadContacts() {
  const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers')) || [];
  const tbody = document.querySelector('#contactsTable tbody');
  tbody.innerHTML = '';

  subscribers.forEach(email => {
    const row = tbody.insertRow();
    const date = new Date(email.timestamp || Date.now()).toLocaleDateString('uk-UA');
    const emailAddr = typeof email === 'string' ? email : email.email;
    
    row.innerHTML = `
      <td>${emailAddr}</td>
      <td>${date}</td>
    `;
  });

  if (subscribers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: var(--muted);">Підписників немає</td></tr>';
  }
}

function exportContacts() {
  const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers')) || [];
  
  if (subscribers.length === 0) {
    alert('⚠️ Немає контактів для експорту');
    return;
  }

  let csv = 'Email,Дата підписки\n';
  subscribers.forEach(email => {
    const emailAddr = typeof email === 'string' ? email : email.email;
    const date = typeof email === 'string' ? new Date().toLocaleDateString('uk-UA') : new Date(email.timestamp).toLocaleDateString('uk-UA');
    csv += `"${emailAddr}","${date}"\n`;
  });

  downloadCSV(csv, 'contacts.csv');
}

// === АНАЛІТИКА ===
function loadAnalytics() {
  renderOrdersChart();
  loadTopProducts();
}

function renderOrdersChart() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const chart = document.getElementById('ordersChart');
  chart.innerHTML = '';

  // Підрахувати замовлення за останні 7 днів
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  const now = new Date();
  orders.forEach(order => {
    const orderDate = new Date(order.date || Date.now());
    const dayDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    
    if (dayDiff < 7) {
      const dayIndex = (6 - dayDiff) % 7;
      counts[dayIndex]++;
    }
  });

  const maxCount = Math.max(...counts) || 1;

  counts.forEach((count, index) => {
    const height = (count / maxCount) * 100 + '%';
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = height;
    bar.style.minHeight = '20px';
    bar.innerHTML = `<div class="chart-label">${days[index]}<br>${count}</div>`;
    chart.appendChild(bar);
  });
}

function loadTopProducts() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const productCounts = {};

  orders.forEach(order => {
    if (order.items) {
      order.items.forEach(item => {
        productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
      });
    }
  });

  const sorted = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const tbody = document.querySelector('#topProductsTable tbody');
  tbody.innerHTML = '';

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: var(--muted);">Немає даних</td></tr>';
    return;
  }

  sorted.forEach(([name, count]) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${name}</td>
      <td>${count}</td>
    `;
  });
}

// === НАЛАШТУВАННЯ ===
function clearAllData() {
  if (!confirm('⚠️ УВАГА! Це видалить ВСІ дані (замовлення, кошик, тощо).\nВи впевнені?')) {
    return;
  }

  if (!confirm('🚨 ОСТАТОЧНЕ ПІДТВЕРДЖЕННЯ? Це не можна скасувати!')) {
    return;
  }

  localStorage.removeItem('cart');
  localStorage.removeItem('wishlist');
  localStorage.removeItem('orders');
  localStorage.removeItem('newsletter_subscribers');

  alert('✅ Усі дані очищені');
  initDashboard();
}

function exportAllData() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers')) || [];

  const data = {
    exportDate: new Date().toLocaleString('uk-UA'),
    products: PRODUCTS,
    orders: orders,
    cart: cart,
    subscribers: subscribers,
    promoCodes: PROMO_CODES
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-${new Date().getTime()}.json`;
  a.click();
  window.URL.revokeObjectURL(url);

  alert('✅ Дані експортовані');
}

function createBackup() {
  const backup = {
    timestamp: new Date().getTime(),
    date: new Date().toLocaleString('uk-UA'),
    data: {
      products: PRODUCTS,
      orders: JSON.parse(localStorage.getItem('orders')) || [],
      subscribers: JSON.parse(localStorage.getItem('newsletter_subscribers')) || [],
      promoCodes: PROMO_CODES
    }
  };

  let backups = JSON.parse(localStorage.getItem('admin_backups')) || [];
  backups.push(backup);

  // Зберегти тільки останні 10 бекапів
  if (backups.length > 10) {
    backups = backups.slice(-10);
  }

  localStorage.setItem('admin_backups', JSON.stringify(backups));
}

// === ДОПОМІЖНІ ФУНКЦІЇ ===
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.click();
}

function refreshProducts() {
  // Примусово перезавантажити дані з localStorage
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    try {
      PRODUCTS.splice(0, PRODUCTS.length, ...JSON.parse(savedProducts));
      loadProducts();
      alert('✅ Дані товарів оновлено');
    } catch (e) {
      alert('❌ Помилка оновлення даних: ' + e.message);
    }
  } else {
    alert('⚠️ Немає збережених даних товарів');
  }
}

function logout() {
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminLoginTime');
  window.location.href = 'admin-login.html';
}

// === CONTENT MANAGEMENT ===
function loadContentSettings() {
  // Завантажити контакти
  const contacts = JSON.parse(localStorage.getItem('siteContacts')) || {
    phone1: '+38 (0412) 12-34-56',
    phone2: '+38 (095) 123-45-67',
    email: 'info@harmonyclimate.zt.ua',
    address: 'вул. Київська, 15, Житомир, 10001, Україна'
  };
  
  document.getElementById('contactPhone1').value = contacts.phone1;
  document.getElementById('contactPhone2').value = contacts.phone2;
  document.getElementById('contactEmail').value = contacts.email;
  document.getElementById('contactAddress').value = contacts.address;
  
  // Завантажити SEO
  const seo = JSON.parse(localStorage.getItem('siteSEO')) || {
    description: 'Гарантійні кондиціонери для дому та бізнесу. Професійний монтаж, доставка по Житомирській області, 24/7 підтримка.',
    keywords: 'кондиціонери, купити кондиціонер, монтаж кондиціонера, Житомир, Житомирська область'
  };
  
  document.getElementById('metaDesc').value = seo.description;
  document.getElementById('metaKeywords').value = seo.keywords;
}

function saveContacts() {
  const contacts = {
    phone1: document.getElementById('contactPhone1').value.trim(),
    phone2: document.getElementById('contactPhone2').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    address: document.getElementById('contactAddress').value.trim()
  };
  
  localStorage.setItem('siteContacts', JSON.stringify(contacts));
  alert('✅ Контакти збережено');
}

function saveSEO() {
  const seo = {
    description: document.getElementById('metaDesc').value.trim(),
    keywords: document.getElementById('metaKeywords').value.trim()
  };
  
  localStorage.setItem('siteSEO', JSON.stringify(seo));
  alert('✅ SEO налаштування збережено');
}
window.addEventListener('click', (e) => {
  const productModal = document.getElementById('productModal');
  const promoModal = document.getElementById('promoModal');

  if (e.target === productModal) {
    closeProductModal();
  }
  if (e.target === promoModal) {
    closePromoModal();
  }
});
