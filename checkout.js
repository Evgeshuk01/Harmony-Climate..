// ================= CHECKOUT PAGE JAVASCRIPT =================

// Global variables for selected options
let selectedDelivery = 'courier'; // default
let selectedPayment = 'card'; // default

document.addEventListener('DOMContentLoaded', function() {
  // Initialize checkout functionality
  initializeCheckout();
  setupEventListeners();
  updateProgressBar();
  setupAnimations();
});

// Initialize checkout data
function initializeCheckout() {
  // Check if cart is empty
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    showNotification('Кошик порожній. Додайте товари перед оформленням замовлення.', 'error');
    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 2000);
    return;
  }

  // Load products and render
  loadProductsFromStorage();
  updateCartBadge();
  renderDeliveryOptions();
  renderPaymentOptions();
  renderOrderSummary();
}

// Setup all event listeners
function setupEventListeners() {
  const form = document.getElementById('checkoutForm');

  // Form validation
  form.addEventListener('input', handleInputValidation);
  form.addEventListener('blur', handleInputValidation, true);

  // Delivery options
  document.addEventListener('change', handleDeliveryChange);

  // Payment options
  document.addEventListener('change', handlePaymentChange);

  // Extras checkboxes
  document.getElementById('insurance').addEventListener('change', updateOrderSummary);
  document.getElementById('giftWrap').addEventListener('change', updateOrderSummary);

  // Form submission
  form.addEventListener('submit', handleFormSubmit);
}

// Load products from storage
function loadProductsFromStorage() {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    try {
      const parsed = JSON.parse(savedProducts);
      if (Array.isArray(parsed) && parsed.length > 0) {
        PRODUCTS.splice(0, PRODUCTS.length, ...parsed);
      }
    } catch (e) {
      console.error('Помилка при завантаженні товарів:', e);
    }
  }
}

// Update cart badge
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    cartBadge.textContent = totalItems;
  }
}

// Render delivery options
function renderDeliveryOptions() {
  const deliveryOptionsContainer = document.getElementById('deliveryOptions');
  deliveryOptionsContainer.innerHTML = '';

  DELIVERY_OPTIONS.forEach(option => {
    const label = document.createElement('label');
    label.className = 'delivery-option';
    label.innerHTML = `
      <input type="radio" name="delivery" value="${option.id}" ${option.id === 'courier' ? 'checked' : ''}>
      <div>
        <strong>${option.name}</strong>
        <span class="price">${option.price > 0 ? `+${option.price} ₴` : 'Безкоштовно'}</span>
      </div>
    `;

    label.addEventListener('change', () => {
      selectedDelivery = option.id;
      updateOrderSummary();
      updateProgressBar();
    });

    deliveryOptionsContainer.appendChild(label);
  });
}

// Render payment options
function renderPaymentOptions() {
  const paymentOptionsContainer = document.getElementById('paymentOptions');
  paymentOptionsContainer.innerHTML = '';

  PAYMENT_METHODS.forEach(method => {
    const label = document.createElement('label');
    label.className = 'payment-option';
    label.innerHTML = `
      <input type="radio" name="payment" value="${method.id}" ${method.id === 'card' ? 'checked' : ''}>
      <div>
        <strong>${method.icon} ${method.name}</strong>
        ${method.commission > 0 ? `<span class="price">+${method.commission} ₴</span>` : ''}
      </div>
    `;

    label.addEventListener('change', () => {
      selectedPayment = method.id;
      updateOrderSummary();
      updateProgressBar();
    });

    paymentOptionsContainer.appendChild(label);
  });
}

// Render order summary
function renderOrderSummary() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const summaryItems = document.getElementById('summaryItems');
  summaryItems.innerHTML = '';

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    const div = document.createElement('div');
    div.className = 'summary-item';
    div.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <p class="muted">${item.quantity} × ${item.price.toLocaleString()} ₴</p>
      </div>
      <span>${itemTotal.toLocaleString()} ₴</span>
    `;
    summaryItems.appendChild(div);
  });

  updateOrderSummary();
}

// Update order summary totals
function updateOrderSummary() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Get delivery cost
  const deliveryOption = DELIVERY_OPTIONS.find(d => d.id === selectedDelivery);
  const deliveryPrice = deliveryOption ? deliveryOption.price : 100;

  // Get payment commission
  const paymentMethod = PAYMENT_METHODS.find(p => p.id === selectedPayment);
  const paymentCommission = paymentMethod ? paymentMethod.commission : 0;

  // Calculate extras
  let insurance = 0;
  let gift = 0;

  const insuranceCheckbox = document.getElementById('insurance');
  const giftCheckbox = document.getElementById('giftWrap');

  if (insuranceCheckbox && insuranceCheckbox.checked) {
    insurance = 50;
    document.getElementById('insuranceRow').style.display = 'flex';
  } else {
    document.getElementById('insuranceRow').style.display = 'none';
  }

  if (giftCheckbox && giftCheckbox.checked) {
    gift = 30;
    document.getElementById('giftRow').style.display = 'flex';
  } else {
    document.getElementById('giftRow').style.display = 'none';
  }

  const total = subtotal + deliveryPrice + paymentCommission + insurance + gift;

  // Update display
  document.getElementById('summarySubtotal').textContent = `${subtotal.toLocaleString()} ₴`;
  document.getElementById('summaryDelivery').textContent = deliveryPrice === 0 ? '🎁 Безкоштовно' : `+${deliveryPrice} ₴`;
  document.getElementById('summaryTotal').textContent = `${total.toLocaleString()} ₴`;

  // Store for submission
  localStorage.setItem('orderData', JSON.stringify({
    subtotal,
    deliveryPrice,
    paymentCommission,
    insurance,
    gift,
    total
  }));
}

// Update progress bar
function updateProgressBar() {
  const progressContainer = document.querySelector('.checkout-progress');
  const steps = document.querySelectorAll('.progress-step');

  // Calculate completion percentage based on filled fields
  let completedSteps = 0;

  // Step 1: Contact info
  if (document.getElementById('firstName').value &&
      document.getElementById('lastName').value &&
      document.getElementById('email').value &&
      document.getElementById('phone').value) {
    completedSteps++;
  }

  // Step 2: Delivery method
  if (selectedDelivery) {
    completedSteps++;
  }

  // Step 3: Address
  if (document.getElementById('city').value &&
      document.getElementById('street').value &&
      document.getElementById('building').value) {
    completedSteps++;
  }

  // Step 4: Payment method
  if (selectedPayment) {
    completedSteps++;
  }

  // Step 5: Always available (additional info is optional)
  completedSteps++;

  // Update progress bar width using CSS custom property
  const progressPercentage = (completedSteps / 5) * 100;
  if (progressContainer) {
    progressContainer.style.setProperty('--progress-width', `${progressPercentage}%`);
  }

  // Update step indicators
  steps.forEach((step, index) => {
    if (index < completedSteps) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (index === completedSteps - 1) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });
}

// Handle input validation
function handleInputValidation(e) {
  const field = e.target;
  const fieldGroup = field.closest('.field-group');
  const errorElement = fieldGroup ? fieldGroup.querySelector('.error-message') : null;

  if (!errorElement) return;

  // Clear previous error
  field.classList.remove('error');
  errorElement.textContent = '';

  // Validate based on field type
  let isValid = true;
  let errorMessage = '';

  switch (field.id) {
    case 'firstName':
    case 'lastName':
      if (field.value.trim().length < 2) {
        isValid = false;
        errorMessage = 'Мінімум 2 символи';
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        errorMessage = 'Невірний формат email';
      }
      break;

    case 'phone':
      const phoneRegex = /^(\+380|0)[0-9]{9}$/;
      const cleanPhone = field.value.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        isValid = false;
        errorMessage = 'Формат: +380XXXXXXXXX або 0XXXXXXXXX';
      } else {
        // Format phone number
        field.value = formatPhoneNumber(cleanPhone);
      }
      break;

    case 'city':
    case 'street':
    case 'building':
      if (field.value.trim().length < 1) {
        isValid = false;
        errorMessage = 'Обов\'язкове поле';
      }
      break;
  }

  if (!isValid) {
    field.classList.add('error');
    errorElement.textContent = errorMessage;
  }

  updateProgressBar();
}

// Format phone number
function formatPhoneNumber(phone) {
  if (phone.startsWith('+380')) {
    return `+380 ${phone.slice(4, 6)} ${phone.slice(6, 9)} ${phone.slice(9, 11)} ${phone.slice(11)}`;
  } else if (phone.startsWith('0')) {
    return `+380 ${phone.slice(1, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8)}`;
  }
  return phone;
}

// Handle delivery change
function handleDeliveryChange(e) {
  if (e.target.name === 'delivery') {
    selectedDelivery = e.target.value;
    updateOrderSummary();
    updateProgressBar();
  }
}

// Handle payment change
function handlePaymentChange(e) {
  if (e.target.name === 'payment') {
    selectedPayment = e.target.value;
    updateOrderSummary();
    updateProgressBar();
  }
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Обробка...';

  // Validate all required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'street', 'building'];
  let hasErrors = false;

  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    const event = new Event('blur');
    field.dispatchEvent(event);

    if (field.classList.contains('error') || !field.value.trim()) {
      hasErrors = true;
    }
  });

  if (hasErrors) {
    showNotification('Будь ласка, заповніть всі обов\'язкові поля правильно', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = '✅ Підтвердити замовлення';
    return;
  }

  // Collect form data
  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    city: document.getElementById('city').value,
    street: document.getElementById('street').value.trim(),
    building: document.getElementById('building').value.trim(),
    apartment: document.getElementById('apartment').value.trim(),
    delivery: selectedDelivery,
    payment: selectedPayment,
    notes: document.getElementById('notes').value.trim(),
    insurance: document.getElementById('insurance').checked,
    giftWrap: document.getElementById('giftWrap').checked,
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    orderData: JSON.parse(localStorage.getItem('orderData')),
    orderNumber: generateOrderNumber(),
    date: new Date().toISOString(),
    status: 'pending'
  };

  // Save order
  try {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(formData);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('lastOrder', JSON.stringify(formData));

    // Clear cart and related data
    localStorage.removeItem('cart');
    localStorage.removeItem('cartSummary');
    localStorage.removeItem('orderData');

    // Show success message
    showNotification(`🎉 Замовлення №${formData.orderNumber} успішно оформлено! Деталі надіслані на ${formData.email}`, 'success');

    // Redirect after delay
    setTimeout(() => {
      window.location.href = 'catalog.html';
    }, 3000);

  } catch (error) {
    console.error('Error saving order:', error);
    showNotification('Помилка при оформленні замовлення. Спробуйте ще раз.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = '✅ Підтвердити замовлення';
  }
}

// Generate order number
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `HC${timestamp}${random}`;
}

// Setup animations
function setupAnimations() {
  // Intersection Observer for form sections
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  // Observe form sections
  document.querySelectorAll('.form-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.success-message');
  existingNotifications.forEach(notification => notification.remove());

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `success-message ${type}`;
  notification.textContent = message;

  // Style based on type
  if (type === 'error') {
    notification.style.background = '#f44336';
  } else if (type === 'success') {
    notification.style.background = '#4CAF50';
  } else {
    notification.style.background = '#2196F3';
  }

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInFromRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .success-message {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }
`;
document.head.appendChild(style);
