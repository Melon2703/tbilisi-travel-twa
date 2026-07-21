import { Route } from '../types/route';

export const ROUTES: Route[] = [
  {
    id: 'sololaki-courtyards',
    title: 'Sololaki Italianate Courtyards & Stained Glass',
    subtitle: 'Low-incline residential walk through 19th-century merchant mansions',
    durationCategory: '1-2h',
    accessibility: 'stroller-friendly',
    vibes: ['courtyards', 'photo-spots'],
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    introCopy:
      'Explore the peaceful, flat avenues of Sololaki where 19th-century merchants built opulent European mansions around lush wooden courtyards.',
    stops: [
      {
        id: 'sololaki-stop-1',
        order: 1,
        name: 'Lado Asatiani St Merchant Houses',
        neighborhood: 'Sololaki',
        coordinates: { lat: 41.6918, lng: 44.7972 },
        estimatedMinutes: 25,
        imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Gently push through the wooden carriage doors into court #28. The original 1890s oil-painted ceiling is hidden right inside the foyer!',
        bestTimeOfDay: 'Morning (10 AM - 12 PM)',
      },
      {
        id: 'sololaki-stop-2',
        order: 2,
        name: 'Galaktion Tabidze Balcony House',
        neighborhood: 'Sololaki',
        coordinates: { lat: 41.6931, lng: 44.7989 },
        estimatedMinutes: 25,
        imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Look up at the spiral wrought-iron balcony. Afternoon light hits the turquoise stained glass windows around 4 PM.',
        bestTimeOfDay: 'Late afternoon (3 PM - 5 PM)',
      },
      {
        id: 'sololaki-stop-3',
        order: 3,
        name: 'Machabeli St Stained Glass Foyer',
        neighborhood: 'Sololaki',
        coordinates: { lat: 41.6908, lng: 44.7995 },
        estimatedMinutes: 20,
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Resident Tbilisi street cats often sunbathe by the inner fountain. A cozy stop with flat, wide sidewalks.',
      },
    ],
  },
  {
    id: 'vera-architecture-walk',
    title: 'Vera Bohemian Manor & Modernist Walk',
    subtitle: 'Shaded avenues, Art Nouveau facades, and hidden garden cafes',
    durationCategory: '2-4h',
    accessibility: 'moderate',
    vibes: ['architecture', 'courtyards'],
    heroImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    introCopy:
      'Vera combines tree-lined residential tranquility with breathtaking turn-of-the-century architecture and leafy courtyard cafes.',
    stops: [
      {
        id: 'vera-stop-1',
        order: 1,
        name: 'Kiacheli St Art Nouveau Mansion',
        neighborhood: 'Vera',
        coordinates: { lat: 41.7042, lng: 44.7895 },
        estimatedMinutes: 30,
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Notice the subtle dragon and floral motifs carved on the stone lintel — a prime example of 1905 Tbilisi Modernism.',
        logisticsWarning: 'Moderate gradient on Kiacheli St with slightly uneven historic paving.',
      },
      {
        id: 'vera-stop-2',
        order: 2,
        name: 'Rooms Courtyard & Garden',
        neighborhood: 'Vera',
        coordinates: { lat: 41.7065, lng: 44.7881 },
        estimatedMinutes: 40,
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Order a hot Georgian thyme tea under the century-old plane trees. The glass garden house is magic on rainy afternoons.',
      },
      {
        id: 'vera-stop-3',
        order: 3,
        name: 'Tarkhnishvili Secret Passages',
        neighborhood: 'Vera',
        coordinates: { lat: 41.7089, lng: 44.7864 },
        estimatedMinutes: 30,
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Walk down the brick archway between #7 and #9 to enter a secluded courtyard with vintage carpets and wild ivy.',
      },
    ],
  },
  {
    id: 'old-tbilisi-fortress-ridge',
    title: 'Old Kala Cobblestones & Narikala Ridge',
    subtitle: 'Panoramic skyline vistas, sulfur bath domes, and citadel steps',
    durationCategory: '2-4h',
    accessibility: 'steep-stairs',
    vibes: ['photo-spots', 'architecture'],
    heroImage: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80',
    introCopy:
      'Step back into medieval Tbilisi along the ancient cliffside citadel of Narikala and the sulfur bath district of Abanotubani.',
    stops: [
      {
        id: 'old-kala-stop-1',
        order: 1,
        name: 'Abanotubani Sulfur Bath Domes',
        neighborhood: 'Old Kala',
        coordinates: { lat: 41.6883, lng: 44.8094 },
        estimatedMinutes: 30,
        imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Walk over the brick bath domes for an iconic postcard photo of the Persian blue tile facade of Orbeliani Baths.',
      },
      {
        id: 'old-kala-stop-2',
        order: 2,
        name: 'Betlemi Street Rock Steps',
        neighborhood: 'Old Kala',
        coordinates: { lat: 41.6895, lng: 44.8051 },
        estimatedMinutes: 35,
        imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Catch your breath halfway up the 120 Betlemi stone stairs — the view of Metekhi cliff across the river is legendary.',
        logisticsWarning: 'Steep 30° stone staircase with no handrails in certain sections. High exertion required.',
      },
      {
        id: 'old-kala-stop-3',
        order: 3,
        name: 'Narikala Citadel Panorama',
        neighborhood: 'Old Kala',
        coordinates: { lat: 41.6876, lng: 44.8055 },
        estimatedMinutes: 40,
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Golden hour here lights up Mother of Georgia (Kartlis Deda) and the entire Mtkvari river valley.',
        bestTimeOfDay: 'Sunset (7:00 PM - 8:30 PM)',
      },
    ],
  },
  {
    id: 'chugureti-fabrika-culinary',
    title: 'Chugureti Wine Cellars & Fabrika Art District',
    subtitle: 'Qvevri wine tastings, street art, and polyphonic dining spots',
    durationCategory: '2-4h',
    accessibility: 'stroller-friendly',
    vibes: ['food-wine', 'photo-spots'],
    heroImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    introCopy:
      'Cross the river into vibrant Chugureti for natural wines, modern street art murals, and historic German-style merchant avenues.',
    stops: [
      {
        id: 'chugureti-stop-1',
        order: 1,
        name: 'Agmashenebeli Pedestrian Avenue',
        neighborhood: 'Chugureti',
        coordinates: { lat: 41.7075, lng: 44.8018 },
        estimatedMinutes: 30,
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Stroll the flat restored pedestrian zone and grab a fresh hot Adjarian khachapuri from the neighborhood bakery.',
      },
      {
        id: 'chugureti-stop-2',
        order: 2,
        name: 'Fabrika Courtyard & Murals',
        neighborhood: 'Chugureti',
        coordinates: { lat: 41.7102, lng: 44.8041 },
        estimatedMinutes: 45,
        imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Former Soviet garment factory turned urban hotspot. Head to the back alley for huge mural photo opportunities.',
      },
      {
        id: 'chugureti-stop-3',
        order: 3,
        name: 'Marjanishvili Qvevri Wine Bar',
        neighborhood: 'Chugureti',
        coordinates: { lat: 41.7091, lng: 44.7985 },
        estimatedMinutes: 45,
        imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Ask the sommelier for an unfiltered Amber Kisi wine made in ancient underground Qvevri clay vessels.',
      },
    ],
  },
  {
    id: 'mtatsminda-panoramic-trail',
    title: 'Mtatsminda Ridge & Funicular Panorama Trail',
    subtitle: 'High altitude pine forest walk overlooking the whole Tbilisi valley',
    durationCategory: 'half-day',
    accessibility: 'steep-stairs',
    vibes: ['photo-spots', 'food-wine'],
    heroImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    introCopy:
      'Ascend the sacred mountain Mtatsminda for pine mountain air, historic pantheon tombs, famous cream doughnuts, and panoramic city views.',
    stops: [
      {
        id: 'mtatsminda-stop-1',
        order: 1,
        name: 'Vilnius Park & Funicular Base',
        neighborhood: 'Mtatsminda',
        coordinates: { lat: 41.6975, lng: 44.7915 },
        estimatedMinutes: 30,
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Grab a rich Georgian espresso near Vilnius park before hopping onto the cable funicular train.',
      },
      {
        id: 'mtatsminda-stop-2',
        order: 2,
        name: 'Mama Daviti Church & Pantheon',
        neighborhood: 'Mtatsminda',
        coordinates: { lat: 41.6955, lng: 44.7891 },
        estimatedMinutes: 45,
        imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Drink from the mountain holy spring tap inside the stone alcove. The air up here is always 3 degrees cooler.',
        logisticsWarning: 'Loose gravel mountain path with steep incline sections.',
      },
      {
        id: 'mtatsminda-stop-3',
        order: 3,
        name: 'Mtatsminda Peak Doughnut Pavilion',
        neighborhood: 'Mtatsminda',
        coordinates: { lat: 41.6942, lng: 44.7842 },
        estimatedMinutes: 60,
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
        olyaTips:
          'Do NOT leave without ordering hot cream-filled ponchiki doughnuts and cold tarragon Lagidze soda on the terrace balcony!',
      },
    ],
  },
];

export function getAllRoutes(): Route[] {
  return ROUTES;
}

export function getRouteById(id: string): Route | undefined {
  return ROUTES.find((route) => route.id === id);
}
