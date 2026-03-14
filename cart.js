// ================= CART PAGE JAVASCRIPT =================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart functionality
  initializeCart();
  setupEventListeners();
  updateCartDisplay();
  loadRecommendations();
  setupAnimations();
});

// Initialize cart data
function initializeCart() {
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Quantity controls
  document.addEventListener('click', handleQuantityChange);

  // Remove items
  document.addEventListener('click', handleRemoveItem);

  // Sort functionality
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSortChange);
  }

  // Clear cart
  const clearBtn = document.getElementById('clearCartBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearCart);
  }

  // Coupon functionality
  const couponBtn = document.getElementById('applyCouponBtn');
  if (couponBtn) {
    couponBtn.addEventListener('click', applyCoupon);
  }

  // Quick checkout
  const checkoutBtn = document.getElementById('quickCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleQuickCheckout);
  }

  // Recommendation clicks
  document.addEventListener('click', handleRecommendationClick);
}

// Handle quantity change
function handleQuantityChange(e) {
  if (e.target.classList.contains('quantity-btn')) {
    e.preventDefault();
    const cartItem = e.target.closest('.cart-item');
    const productId = parseInt(cartItem.dataset.productId);
    const action = e.target.dataset.action;

    const cart = JSON.parse(localStorage.getItem('cart'));
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
      if (action === 'increase') {
        cart[itemIndex].quantity += 1;
      } else if (action === 'decrease' && cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity -= 1;
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartDisplay();
      showNotification('Кількість оновлено', 'success');
    }
  }
}

// Handle remove item
function handleRemoveItem(e) {
  if (e.target.classList.contains('remove-btn')) {
    e.preventDefault();
    const cartItem = e.target.closest('.cart-item');
    const productId = parseInt(cartItem.dataset.productId);

    if (confirm('Видалити товар з кошика?')) {
      const cart = JSON.parse(localStorage.getItem('cart'));
      const updatedCart = cart.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      cartItem.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        updateCartDisplay();
        showNotification('Товар видалено з кошика', 'success');
      }, 300);
    }
  }
}

// Handle sort change
function handleSortChange(e) {
  const sortBy = e.target.value;
  const cart = JSON.parse(localStorage.getItem('cart'));

  switch (sortBy) {
    case 'price-low':
      cart.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      cart.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      cart.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      cart.sort((a, b) => b.id - a.id);
      break;
    default:
      // Keep original order
      break;
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
}

// Clear entire cart
function clearCart() {
  if (confirm('Очистити весь кошик?')) {
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartDisplay();
    showNotification('Кошик очищено', 'success');
  }
}

// Apply coupon
function applyCoupon() {
  const couponInput = document.getElementById('couponInput');
  const couponCode = couponInput.value.trim().toUpperCase();
  const messageEl = document.getElementById('couponMessage');

  // Available coupons
  const coupons = {
    'SALE10': { discount: 10, type: 'percent' },
    'SALE500': { discount: 500, type: 'fixed' },
    'WELCOME': { discount: 15, type: 'percent' }
  };

  if (coupons[couponCode]) {
    const coupon = coupons[couponCode];
    localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
    updateCartDisplay();
    showNotification(`Купон "${couponCode}" застосовано!`, 'success');

    messageEl.textContent = `Купон "${couponCode}" успішно застосовано!`;
    messageEl.className = 'coupon-message success';
  } else {
    messageEl.textContent = 'Невірний код купона';
    messageEl.className = 'coupon-message error';
  }

  couponInput.value = '';
}

// Handle quick checkout
function handleQuickCheckout(e) {
  e.preventDefault();

  const cart = JSON.parse(localStorage.getItem('cart'));
  if (cart.length === 0) {
    showNotification('Кошик порожній', 'error');
    return;
  }

  // Get form data
  const name = document.getElementById('checkoutName').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();

  if (!name || !phone || !address) {
    showNotification('Будь ласка, заповніть всі поля', 'error');
    return;
  }

  // Validate phone number (Ukrainian format)
  const phoneRegex = /^(\+380|0)[0-9]{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    showNotification('Невірний формат телефону', 'error');
    return;
  }

  // Calculate total
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon'));
  let discount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = subtotal * (appliedCoupon.discount / 100);
    } else {
      discount = Math.min(appliedCoupon.discount, subtotal);
    }
  }

  const total = subtotal - discount;

  // Create order object
  const order = {
    id: Date.now(),
    customer: { name, phone, address },
    items: cart,
    subtotal: subtotal,
    discount: discount,
    total: total,
    coupon: appliedCoupon,
    date: new Date().toISOString(),
    status: 'pending'
  };

  // Save order (in real app, this would go to server)
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Clear cart and coupon
  localStorage.setItem('cart', JSON.stringify([]));
  localStorage.removeItem('appliedCoupon');

  // Show success message
  showNotification('Замовлення успішно оформлено!', 'success');

  // Redirect to success page or show modal
  setTimeout(() => {
    window.location.href = 'checkout.html';
  }, 2000);
}

// Handle recommendation click
function handleRecommendationClick(e) {
  if (e.target.closest('.recommendation-card')) {
    const card = e.target.closest('.recommendation-card');
    const productId = parseInt(card.dataset.productId);

    // Add to cart
    const cart = JSON.parse(localStorage.getItem('cart'));
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const product = getProductById(productId);
      if (product) {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        });
      }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Товар додано до кошика', 'success');

    // Animate the card
    card.style.animation = 'bounce 0.6s ease';
    setTimeout(() => {
      card.style.animation = '';
    }, 600);
  }
}

// Update cart display
function updateCartDisplay() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const cartContainer = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartToolbar = document.getElementById('cartToolbar');
  const cartBottom = document.getElementById('cartBottom');

  if (cart.length === 0) {
    cartContainer.innerHTML = '';
    emptyCart.style.display = 'block';
    cartToolbar.style.display = 'none';
    cartBottom.style.display = 'none';
    return;
  }

  emptyCart.style.display = 'none';
  cartToolbar.style.display = 'block';
  cartBottom.style.display = 'grid';

  // Render cart items
  cartContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-product-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.name}</h4>
        <p class="cart-item-price">${item.price.toLocaleString()} ₴</p>
        <p class="cart-item-stock">В наявності</p>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-controls">
          <button class="quantity-btn" data-action="decrease">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" readonly>
          <button class="quantity-btn" data-action="increase">+</button>
        </div>
        <button class="remove-btn">Видалити</button>
      </div>
    </div>
  `).join('');

  // Update summary
  updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon'));

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = subtotal * (appliedCoupon.discount / 100);
    } else {
      discount = Math.min(appliedCoupon.discount, subtotal);
    }
  }

  const total = subtotal - discount;

  // Update delivery progress
  updateDeliveryProgress(total);

  // Update summary display
  document.getElementById('subtotal').textContent = `${subtotal.toLocaleString()} ₴`;
  document.getElementById('discount').textContent = discount > 0 ? `-${discount.toLocaleString()} ₴` : '0 ₴';
  document.getElementById('total').textContent = `${total.toLocaleString()} ₴`;

  // Show/hide discount row
  const discountRow = document.getElementById('discountRow');
  if (discount > 0) {
    discountRow.style.display = 'flex';
  } else {
    discountRow.style.display = 'none';
  }
}

// Update delivery progress
function updateDeliveryProgress(total) {
  const progressBar = document.querySelector('.progress-fill');
  const deliveryStatus = document.querySelector('.delivery-status');

  let progress = 0;
  let status = 'Безкоштовна доставка від 3000 ₴';

  if (total >= 3000) {
    progress = 100;
    status = 'Безкоштовна доставка!';
  } else if (total >= 2000) {
    progress = 75;
    status = 'Залишилось 1000 ₴ до безкоштовної доставки';
  } else if (total >= 1000) {
    progress = 50;
    status = 'Залишилось 2000 ₴ до безкоштовної доставки';
  } else {
    progress = (total / 1000) * 25;
    status = 'Залишилось 3000 ₴ до безкоштовної доставки';
  }

  progressBar.style.width = `${progress}%`;
  deliveryStatus.textContent = status;
}

// Load recommendations
function loadRecommendations() {
  const recommendationsContainer = document.getElementById('recommendationsGrid');
  if (!recommendationsContainer) return;

  // Get products from data.js (assuming it's loaded)
  if (typeof products !== 'undefined') {
    // Get random 6 products as recommendations
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const recommendations = shuffled.slice(0, 6);

    recommendationsContainer.innerHTML = recommendations.map(product => `
      <div class="recommendation-card" data-product-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="recommendation-image">
        <h4 class="recommendation-title">${product.name}</h4>
        <p class="recommendation-price">${product.price.toLocaleString()} ₴</p>
      </div>
    `).join('');
  }
}

// Setup animations
function setupAnimations() {
  // Intersection Observer for animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  // Observe cart items and recommendations
  document.querySelectorAll('.cart-item, .recommendation-card').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(item);
  });
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Style the notification
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    zIndex: '1000',
    animation: 'slideInFromRight 0.3s ease-out'
  });

  // Set background color based on type
  if (type === 'success') {
    notification.style.background = '#4CAF50';
  } else if (type === 'error') {
    notification.style.background = '#f44336';
  } else {
    notification.style.background = '#2196F3';
  }

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutToRight 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Helper function to get product by ID
function getProductById(id) {
  if (typeof products !== 'undefined') {
    return products.find(product => product.id === id);
  }
  return null;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInFromRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideOutToRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }

  @keyframes slideOut {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-30px); opacity: 0; }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }

  .notification {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;
document.head.appendChild(style);
