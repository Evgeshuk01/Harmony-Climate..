const PRODUCTS = [
  {
    id: 1,
    name: "Basic 07",
    description: "Для невеликих кімнат • до 25 м²",
    fullDescription: "Економічний варіант для невеликих приміщень. Надійний, простий у використанні. Ідеально підходить для спалень та робочих кабінетів.",
    price: 7000,
    area: 25,
    wifi: "no",
    color: "white",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop",
    rating: 4.0,
    reviews: 18,
    badge: "популярний",
    inStock: true,
    stock: 12,
    warranty: "2 роки",
    delivery: "1-2 дні",
    features: ["tiho"],
    power: 1.2,
    noise: 26,
    recommendedWith: [2, 5]
  },
  {
    id: 2,
    name: "Smart 09",
    description: "Інвертор • спальня",
    fullDescription: "Інверторна технологія забезпечує енергозбереження. Тихий режим для комфортного сну. Функція автоматичного налаштування температури.",
    price: 12000,
    area: 25,
    wifi: "yes",
    color: "white",
    image: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400&h=400&fit=crop",
    rating: 4.3,
    reviews: 32,
    badge: "новинка",
    inStock: true,
    stock: 8,
    warranty: "3 роки",
    delivery: "1-2 дні",
    features: ["wifi", "tiho", "ekonom"],
    power: 1.0,
    noise: 23
  },
  {
    id: 3,
    name: "Silent Pro",
    description: "Тихий режим • до 25 м²",
    fullDescription: "Найтихіший у своєму класі. Спеціальна звукоізоляція. Ідеально для спалень та бібліотек. Рівень шуму: 22 дБ.",
    price: 18000,
    area: 25,
    wifi: "yes",
    color: "white",
    image: "https://images.unsplash.com/photo-1584890677796-1b70fce15367?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 45,
    badge: "топ-вибір",
    inStock: true,
    stock: 5,
    warranty: "3 роки",
    delivery: "2-3 дні",
    features: ["wifi", "tiho"],
    power: 0.9,
    noise: 22
  },
  {
    id: 4,
    name: "Comfort 12",
    description: "Для квартири • до 40 м²",
    fullDescription: "Оптимальне співвідношення ціни та якості. Потужний компресор для швидкого охолодження. Змінювані фільтри.",
    price: 16000,
    area: 40,
    wifi: "no",
    color: "black",
    image: "https://images.unsplash.com/photo-1584622281867-8a748c4c5fe3?w=400&h=400&fit=crop",
    rating: 4.2,
    reviews: 28,
    badge: "популярний",
    inStock: true,
    stock: 10,
    warranty: "2 роки",
    delivery: "1-2 дні",
    features: ["ekonom"],
    power: 1.5,
    noise: 28
  },
  {
    id: 5,
    name: "Smart Climate",
    description: "Розумний контроль • Wi-Fi",
    fullDescription: "Керування через смартфон з будь-якої точки світу. Розклад роботи. Статистика споживання енергії. IoT готовий.",
    price: 20000,
    area: 40,
    wifi: "yes",
    color: "gray",
    image: "https://via.placeholder.com/300x300?text=Smart+Climate",
    rating: 4.5,
    reviews: 35,
    badge: null,
    inStock: true,
    stock: 7,
    warranty: "3 роки",
    delivery: "2-3 дні",
    features: ["wifi", "ekonom"],
    power: 1.3,
    noise: 25
  },
  {
    id: 6,
    name: "Inverter X",
    description: "Енергоефективний • 40 м²",
    fullDescription: "Найновіша інверторна технологія. Економія електроенергії до 40%. Екологічно чистий холодоагент.",
    price: 24000,
    area: 40,
    wifi: "yes",
    color: "white",
    image: "https://via.placeholder.com/300x300?text=Inverter+X",
    rating: 4.6,
    reviews: 42,
    badge: "топ-вибір",
    inStock: false,
    stock: 0,
    warranty: "3 роки",
    delivery: "3-4 дні",
    features: ["wifi", "ekonom"],
    power: 0.8,
    noise: 24
  },
  {
    id: 7,
    name: "Premium Air",
    description: "Комфорт + дизайн",
    fullDescription: "Преміум обробка з мінімалістичним дизайном. Три кольори на вибір. Функція очищення повітря HEPA.",
    price: 30000,
    area: 40,
    wifi: "yes",
    color: "black",
    image: "https://via.placeholder.com/300x300?text=Premium+Air",
    rating: 4.7,
    reviews: 38,
    badge: "новинка",
    inStock: true,
    stock: 4,
    warranty: "5 років",
    delivery: "2-3 дні",
    features: ["wifi", "tiho"],
    power: 1.4,
    noise: 23
  },
  {
    id: 8,
    name: "Office Cool",
    description: "Офісне рішення",
    fullDescription: "Розроблений для офісів та комерційних просторів. Ефективна робота з високою вологістю. Гарантія 3 роки.",
    price: 28000,
    area: 50,
    wifi: "no",
    color: "gray",
    image: "https://via.placeholder.com/300x300?text=Office+Cool",
    rating: 4.1,
    reviews: 22,
    badge: null,
    inStock: true,
    stock: 6,
    warranty: "3 роки",
    delivery: "2-3 дні",
    features: ["ekonom"],
    power: 1.8,
    noise: 29
  },
  {
    id: 9,
    name: "Power Max",
    description: "Висока потужність",
    fullDescription: "Найпотужніший у лінії. Здатен охолодити великі приміщення за короткий час. Профільна система фільтрації.",
    price: 35000,
    area: 50,
    wifi: "yes",
    color: "black",
    image: "https://via.placeholder.com/300x300?text=Power+Max",
    rating: 4.4,
    reviews: 31,
    badge: "популярний",
    inStock: true,
    stock: 3,
    warranty: "3 роки",
    delivery: "3-4 дні",
    features: ["wifi"],
    power: 2.2,
    noise: 32
  },
  {
    id: 10,
    name: "Business Pro",
    description: "Комерційні приміщення",
    fullDescription: "Для магазинів, ресторанів, офісів. Надійна робота 24/7. Дистанційне управління включено.",
    price: 42000,
    area: 50,
    wifi: "yes",
    color: "gray",
    image: "https://via.placeholder.com/300x300?text=Business+Pro",
    rating: 4.3,
    reviews: 26,
    badge: null,
    inStock: true,
    stock: 2,
    warranty: "5 років",
    delivery: "3-4 дні",
    features: ["wifi"],
    power: 2.0,
    noise: 31
  },
  {
    id: 11,
    name: "Industrial X",
    description: "Максимальна потужність",
    fullDescription: "Рішення для промислових приміщень. Охолодження до -5°C. Безперервна робота. Професійна установка рекомендована.",
    price: 50000,
    area: 50,
    wifi: "yes",
    color: "gray",
    image: "https://via.placeholder.com/300x300?text=Industrial+X",
    rating: 4.5,
    reviews: 19,
    badge: null,
    inStock: false,
    stock: 0,
    warranty: "5 років",
    delivery: "5-7 днів",
    features: ["wifi"],
    power: 2.5,
    noise: 35,
    recommendedWith: [9, 10]
  }
];

// Способи оплати
const PAYMENT_METHODS = [
  { id: 'card', name: 'Кредитна карта', icon: '💳', commission: 0 },
  { id: 'google', name: 'Google Pay', icon: '🔵', commission: 0 },
  { id: 'apple', name: 'Apple Pay', icon: '🍎', commission: 0 },
  { id: 'transfer', name: 'Банківський переказ', icon: '🏦', commission: 0 },
  { id: 'installment', name: 'Розстрочка 0%', icon: '📅', commission: 0 },
  { id: 'cash', name: 'Готівка при отриманні', icon: '💵', commission: 50 }
];

// Способи доставки
const DELIVERY_OPTIONS = [
  { id: 'courier', name: 'Кур\'єр (1-2 дні)', price: 100, days: '1-2' },
  { id: 'pickup', name: 'Самовивіз зі складу (безплатно)', price: 0, days: 'одразу' },
  { id: 'nova', name: 'Нова пошта (2-3 дні)', price: 80, days: '2-3' },
  { id: 'ukrposhta', name: 'Укрпошта (3-5 днів)', price: 60, days: '3-5' }
];

// СИСТЕМА ВІДГУКІВ (зберігається в localStorage)
const REVIEWS = {
  // productId: [{ user, rating, comment, date }, ...]
};

function loadReviews() {
  const stored = localStorage.getItem('reviews');
  if (stored) {
    Object.assign(REVIEWS, JSON.parse(stored));
  }
}

function saveReviews() {
  localStorage.setItem('reviews', JSON.stringify(REVIEWS));
}

function addReview(productId, user, rating, comment) {
  if (!REVIEWS[productId]) REVIEWS[productId] = [];
  REVIEWS[productId].push({
    user,
    rating: parseInt(rating),
    comment,
    date: new Date().toLocaleDateString('uk-UA')
  });
  saveReviews();
}

function getProductReviews(productId) {
  return REVIEWS[productId] || [];
}

function getAverageRating(productId) {
  const reviews = getProductReviews(productId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}
