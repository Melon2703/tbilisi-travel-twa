import { Language } from './types';

export const TRANSLATIONS = {
  en: {
    // RouteIntroCard
    startRoute: 'START ROUTE',
    olyaWelcome: "Olya's Route Welcome",
    routeAtAGlance: 'Route at a Glance',
    curatedStops: 'Curated Stops',
    transitIncluded: 'Transit included',
    pedestrianWalkway: 'Pedestrian Walkway',
    cableCar: 'Cable Car',
    funicular: 'Funicular',
    swipePrompt: '👉 Swipe left or tap below to begin!',

    // StopCard & Venue
    stopOf: 'STOP {order} OF {total}',
    stopNumber: 'STOP {order}',
    visited: 'Visited',
    olyaTip: "Olya's Tip",
    photoSpotRec: 'Photo Spot Recommendation',
    logisticsWarning: 'Logistics Warning',
    min: 'min',
    pitstop: 'Pitstop',
    veggieFriendly: '🌱 Veggie Friendly',
    recommendedDishes: 'Recommended Dishes',
    bookingAdvice: 'Booking Advice',
    transitStep: 'Transit Step',

    cafe: '☕ Cafe',
    restaurant: '🍽️ Restaurant',
    bar: '🍸 Bar',
    wine_bar: '🍷 Wine Bar',

    georgian: 'Georgian',
    european: 'European',
    asian: 'Asian',

    // TimelineBar
    routeCompleted: 'Route completed! All stops visited!',
    jumpToStop: 'Jump to stop {order}: {name}',
    markAsVisited: 'Mark as visited',
    markAsUnvisited: 'Mark as unvisited',

    // Durations
    '1-2h': '1-2h',
    '2-4h': '2-4h',
    '3-4h': '3-4h',
    'half-day': 'half-day',
    'full-day': 'full-day',

    // Accessibility
    'stroller-friendly': 'stroller-friendly',
    'moderate': 'moderate',
    'steep-stairs': 'steep-stairs',

    // Vibes
    'photo-spots': 'photo-spots',
    'courtyards': 'courtyards',
    'food-wine': 'food-wine',
    'architecture': 'architecture',
    'cultural': 'cultural',
    'insta-locations': 'insta-locations',
    'hiking': 'hiking',

    // Route Overview Map & Step Preview
    overviewMapTitle: 'Route Overview Map',
    stepByStepPreviewTitle: 'Step-by-Step Route Preview',
    logisticsTerrainTitle: 'Logistics & Terrain Highlights',
    easyRouteLabel: 'Easy Route Only',
    useMyLocation: 'Nearest to Me',
    locating: 'Locating...',
    allDurations: 'All Durations',
    allVibes: 'All Vibes',

    // Homepage catalog
    headerTitle: 'Tbilisi Travel Routes',
    headerSubtitle: 'Curated Telegram WebApp Guides',
    curatedRoutesCount: '{count} Curated Routes',
    interactiveCatalog: '✨ Interactive Catalog',
    heroTitle: 'Explore Tbilisi on Foot with Local Knowledge',
    heroDesc:
      "Pick a route below for step-by-step navigation, timing advice, Olya's personal recommendations, and logistics notes for steep hills or cobblestone alleys.",
    catalogTitle: 'Curated Routes Catalog',
    catalogSub: 'Tap any card to view timeline',
    viewRoute: 'View ➔',
    footerTitle: 'Tbilisi Travel Guide — Telegram WebApp',
    footerRights: "© {year} Olya's Curated Tbilisi Routes",
    stopsCount: '{count} stops',
  },
  ru: {
    // RouteIntroCard
    startRoute: 'НАЧАТЬ МАРШРУТ',
    olyaWelcome: 'Приветствие от Оли',
    routeAtAGlance: 'Маршрут в деталях',
    curatedStops: 'Остановок в маршруте',
    transitIncluded: 'Включая транспорт',
    pedestrianWalkway: 'Пешеходный маршрут',
    cableCar: 'Канатная дорога',
    funicular: 'Фуникулёр',
    swipePrompt: '👉 Смахните влево или нажмите ниже, чтобы начать!',

    // StopCard & Venue
    stopOf: 'ОСТАНОВКА {order} ИЗ {total}',
    stopNumber: 'ОСТАНОВКА {order}',
    visited: 'Посещено',
    olyaTip: 'Совет от Оли',
    photoSpotRec: 'Лучшее место для фото',
    logisticsWarning: 'Предупреждение о рельефе',
    min: 'мин',
    pitstop: 'Пит-стоп',
    veggieFriendly: '🌱 Вегетарианское',
    recommendedDishes: 'Рекомендуемые блюда',
    bookingAdvice: 'Совет по бронированию',
    transitStep: 'Транзитный шаг',

    cafe: '☕ Кафе',
    restaurant: '🍽️ Ресторан',
    bar: '🍸 Бар',
    wine_bar: '🍷 Винный бар',

    georgian: 'Грузинская',
    european: 'Европейская',
    asian: 'Азиатская',

    // TimelineBar
    routeCompleted: 'Маршрут пройден! Все остановки посещены!',
    jumpToStop: 'Перейти к остановке {order}: {name}',
    markAsVisited: 'Отметить как посещённую',
    markAsUnvisited: 'Снять отметку',

    // Durations
    '1-2h': '1-2 ч',
    '2-4h': '2-4 ч',
    '3-4h': '3-4 ч',
    'half-day': 'полдня',
    'full-day': 'весь день',

    // Accessibility
    'stroller-friendly': 'удобно с коляской',
    'moderate': 'умеренное покрытие',
    'steep-stairs': 'крутые лестницы',

    // Vibes
    'photo-spots': 'фотолокации',
    'courtyards': 'дворики',
    'food-wine': 'еда-и-вино',
    'architecture': 'архитектура',
    'cultural': 'культура',
    'insta-locations': 'инста-локации',
    'hiking': 'хайкинг',

    // Route Overview Map & Step Preview
    overviewMapTitle: 'Карта маршрута',
    stepByStepPreviewTitle: 'Пошаговый обзор маршрута',
    logisticsTerrainTitle: 'Рельеф и логистика',
    easyRouteLabel: 'Только легкие маршруты',
    useMyLocation: 'Ближайшие ко мне',
    locating: 'Определение...',
    allDurations: 'Любая длительность',
    allVibes: 'Все атмосферы',

    // Homepage catalog
    headerTitle: 'Пешие маршруты по Тбилиси',
    headerSubtitle: 'Персональный путеводитель в Telegram WebApp',
    curatedRoutesCount: '{count} отобранных маршрутов',
    interactiveCatalog: '✨ Интерактивный каталог',
    heroTitle: 'Исследуйте Тбилиси пешком с локальным гидом',
    heroDesc:
      'Выберите маршрут ниже для пошаговой навигации, рекомендаций по времени, личных советов Оли и предупреждений о крутых подъемах.',
    catalogTitle: 'Каталог маршрутов',
    catalogSub: 'Нажмите на карточку для просмотра',
    viewRoute: 'Смотреть ➔',
    footerTitle: 'Путеводитель по Тбилиси — Telegram WebApp',
    footerRights: '© {year} Авторские маршруты Оли по Тбилиси',
    stopsCount: '{count} остановок',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;
