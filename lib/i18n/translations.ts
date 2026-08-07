import { Language } from './types';

export const TRANSLATIONS = {
  en: {
    // RouteIntroCard
    startRoute: 'Start Route',
    continueRoute: 'Continue: {name}',
    olyaWelcome: "Olya's route welcome",
    routeAtAGlance: 'Route at a glance',
    curatedStops: 'curated stops',
    transitIncluded: 'Transit included',
    pedestrianWalkway: 'Pedestrian walkway',
    cableCar: 'Cable car',
    funicular: 'Funicular',

    // StopCard & Venue
    stopOf: 'STOP {order} OF {total}',
    stopNumber: 'STOP {order}',
    visited: 'Visited',
    olyaTip: "Olya's tip",
    stopDirective: 'Before you go in',
    historicalSummary: 'Historical overview',
    funFact: 'Fun fact',
    workingHours: 'Working hours',
    website: 'Website / Instagram',
    instagram: 'Instagram',
    photoSpotRec: 'Photo spot recommendation',
    logisticsWarning: 'Logistics warning',
    min: 'min',
    pitstop: 'Pitstop',
    veggieFriendly: '🌱 Veggie Friendly',
    recommendedDishes: 'Recommended dishes',
    bookingAdvice: 'Booking & seating advice',
    transitStep: 'Transit step',
    olyaRecommendation: "Olya's recommendation",

    cafe: '☕ Cafe',
    restaurant: '🍽️ Restaurant',
    bar: '🍸 Bar',
    wine_bar: '🍷 Wine bar',

    georgian: 'Georgian',
    european: 'European',
    asian: 'Asian',

    // TimelineBar
    routeCompleted: 'Route completed! All stops visited!',
    jumpToStop: 'Jump to stop {order}: {name}',
    markAsVisited: 'Mark as visited',
    markAsUnvisited: 'Mark as unvisited',
    routeOverview: 'Route overview',
    previousStops: 'Previous stops',
    moreStops: 'More stops',

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
    'insta-locations': 'insta-spots',
    'hiking': 'hiking',

    // Route Overview Map & Step Preview
    overviewMapTitle: 'Route overview map',
    stepByStepPreviewTitle: 'Route sequence preview',
    logisticsTerrainTitle: 'Logistics & terrain highlights',
    easyRouteLabel: 'Easy route only',
    useMyLocation: 'Nearest to me',
    locating: 'Locating...',
    allDurations: 'All durations',
    allVibes: 'All vibes',
    startPoint: 'START',
    finishPoint: 'FINISH',
    tapPinToInspect: 'Tap any pin for details',
    resetMap: 'Reset view',
    expandMap: 'Expand full map',
    tapToViewFullMap: 'Tap to view full map 🗺️',
    closeMap: 'Close map',
    openInMap: 'Open in map app',
    interactiveMapModal: 'Interactive route map',

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
    familyFullVersion: '{family} — the complete walk',
    familyVariant: 'A shorter version of {family} — {count} of {total} stops',
  },
  ru: {
    // RouteIntroCard
    startRoute: 'НАЧАТЬ МАРШРУТ',
    continueRoute: 'ПРОДОЛЖИТЬ: {name}',
    olyaWelcome: 'Приветствие от Оли',
    routeAtAGlance: 'Маршрут в деталях',
    curatedStops: 'Остановок в маршруте',
    transitIncluded: 'Включая транспорт',
    pedestrianWalkway: 'Пешеходный маршрут',
    cableCar: 'Канатная дорога',
    funicular: 'Фуникулёр',

    // StopCard & Venue
    stopOf: 'ОСТАНОВКА {order} ИЗ {total}',
    stopNumber: 'ОСТАНОВКА {order}',
    visited: 'Посещено',
    olyaTip: 'Совет от Оли',
    stopDirective: 'Прежде чем зайти',
    historicalSummary: 'Историческая справка',
    funFact: 'Интересный факт',
    workingHours: 'Режим работы',
    website: 'Сайт / Instagram',
    instagram: 'Instagram',
    photoSpotRec: 'Лучшее место для фото',
    logisticsWarning: 'Предупреждение о рельефе',
    min: 'мин',
    pitstop: 'Пит-стоп',
    veggieFriendly: '🌱 Вегетарианское',
    recommendedDishes: 'Рекомендуемые блюда',
    bookingAdvice: 'Рекомендация по бронированию',
    transitStep: 'Транзитный шаг',
    olyaRecommendation: 'Рекомендация Оли',

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
    routeOverview: 'Обзор маршрута',
    previousStops: 'Предыдущие остановки',
    moreStops: 'Следующие остановки',

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
    'insta-locations': 'инста-места',
    'hiking': 'хайкинг',

    // Route Overview Map & Step Preview
    overviewMapTitle: 'Карта маршрута',
    stepByStepPreviewTitle: 'Последовательность остановок',
    logisticsTerrainTitle: 'Рельеф и логистика',
    easyRouteLabel: 'Только легкие маршруты',
    useMyLocation: 'Ближайшие ко мне',
    locating: 'Определение...',
    allDurations: 'Любая длительность',
    allVibes: 'Все атмосферы',
    startPoint: 'НАЧАЛО',
    finishPoint: 'ФИНИШ',
    tapPinToInspect: 'Нажмите на точку для деталей',
    resetMap: 'Сбросить вид',
    expandMap: 'Открыть карту на весь экран',
    tapToViewFullMap: 'Нажмите, чтобы открыть карту 🗺️',
    closeMap: 'Закрыть карту',
    openInMap: 'Открыть в навигаторе',
    interactiveMapModal: 'Интерактивная карта маршрута',

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
    familyFullVersion: '{family} — полный маршрут',
    familyVariant: 'Короткая версия маршрута «{family}» — {count} из {total} остановок',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;
