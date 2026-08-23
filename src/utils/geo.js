// Geographical centroid coordinates for Wikimedia event locations

export const countryCentroids = {
  'France': [46.603354, 1.888334],
  'Poland': [51.919438, 19.145136],
  'Kenya': [-0.023559, 37.906193],
  'Singapore': [1.352083, 103.819836],
  'Germany': [51.165691, 10.451526],
  'Italy': [41.87194, 12.56738],
  'United States': [37.09024, -95.712891],
  'USA': [37.09024, -95.712891],
  'United Kingdom': [55.378051, -3.435973],
  'UK': [55.378051, -3.435973],
  'India': [20.593684, 78.96288],
  'Nigeria': [9.081999, 8.675277],
  'Ghana': [7.946527, -1.023194],
  'South Africa': [-30.559482, 22.937506],
  'Brazil': [-14.235004, -51.92528],
  'Mexico': [23.634501, -102.552784],
  'Argentina': [-38.416097, -63.616672],
  'Canada': [56.130366, -106.346771],
  'Australia': [-25.274398, 133.775136],
  'Turkey': [38.963745, 35.243322],
  'Czech Republic': [49.817492, 15.472962],
  'Austria': [47.516231, 14.550072],
  'Switzerland': [46.818188, 8.227512],
  'Netherlands': [52.132633, 5.291266],
  'Spain': [40.463667, -3.74922],
  'Sweden': [60.128161, 18.643501],
  'Norway': [60.472024, 8.468946],
  'Finland': [61.92411, 25.748151],
  'Japan': [36.204824, 138.252924],
  'Taiwan': [23.69781, 120.960515],
  'Indonesia': [-0.789275, 113.921327],
  'Malaysia': [4.210484, 101.975766],
  'Philippines': [12.879721, 121.774017],
  'Thailand': [15.870032, 100.992541],
  'Bangladesh': [23.684994, 90.356331],
  'Nepal': [28.394857, 84.124008],
  'Egypt': [26.820553, 30.802498],
  'Morocco': [31.791702, -7.09262],
  'Tunisia': [33.886917, 9.537499],
  'Ukraine': [48.379433, 31.16558],
  'Greece': [39.074208, 21.824312],
  'Portugal': [39.399872, -8.224454],
  'Ireland': [53.142367, -7.6921]
};

export const cityCentroids = {
  'Katowice': [50.2649, 19.0238],
  'Nairobi': [-1.2921, 36.8219],
  'Paris': [48.8566, 2.3522],
  'Istanbul': [41.0082, 28.9784],
  'Singapore': [1.3521, 103.8198],
  'Stockholm': [59.3293, 18.0686],
  'Cape Town': [-33.9249, 18.4241],
  'Montreal': [45.5017, -73.5673],
  'Esino Lario': [45.9964, 9.3333],
  'Mexico City': [19.4326, -99.1332],
  'London': [51.5074, -0.1278],
  'Hong Kong': [22.3193, 114.1694],
  'Washington': [38.9072, -77.0369],
  'Haifa': [32.7940, 34.9896],
  'Gdansk': [54.3520, 18.6466],
  'Buenos Aires': [-34.6037, -58.3816],
  'Alexandria': [31.2001, 29.9187],
  'Taipei': [25.0330, 121.5654],
  'Cambridge': [42.3736, -71.1097],
  'Frankfurt': [50.1109, 8.6821],
  'Berlin': [52.5200, 13.4050],
  'Den Haag': [52.0705, 4.3007],
  'The Hague': [52.0705, 4.3007],
  'Amsterdam': [52.3676, 4.9041],
  'Prague': [50.0755, 14.4378],
  'Vienna': [48.2082, 16.3738],
  'Warsaw': [52.2297, 21.0122],
  'Tokyo': [35.6762, 139.6503],
  'Sydney': [-33.8688, 151.2093],
  'Rio de Janeiro': [-22.9068, -43.1729],
  'Sao Paulo': [-23.5505, -46.6333],
  'Athens': [37.9838, 23.7275],
  'Rome': [41.9028, 12.4964],
  'Madrid': [40.4168, -3.7038],
  'Lisbon': [38.7223, -9.1393],
  'Dublin': [53.3498, -6.2603],
  'Lagos': [6.5244, 3.3792],
  'Accra': [5.6037, -0.1870],
  'Bhubaneswar': [20.2961, 85.8245],
  'Kochi': [9.9312, 76.2673],
  'Cochin': [9.9312, 76.2673],
  'Kerala': [10.8505, 76.2711],
  'Delhi': [28.6139, 77.2090],
  'Bangalore': [12.9716, 77.5946],
  'Bengaluru': [12.9716, 77.5946],
  'Mumbai': [19.0760, 72.8777],
  'Dhaka': [23.8103, 90.4125],
  'Kathmandu': [27.7172, 85.3240],
  'Jakarta': [-6.2088, 106.8456],
  'Manila': [14.5995, 120.9842],
  'Kuala Lumpur': [3.1390, 101.6869],
  'Bangkok': [13.7563, 100.5018]
};

export const regionCentroids = {
  'CEE': [49.0, 22.0],
  'Central and Eastern Europe': [49.0, 22.0],
  'ESEAP': [2.0, 115.0],
  'East, Southeast Asia and Pacific': [2.0, 115.0],
  'MENA': [26.0, 35.0],
  'Middle East and North Africa': [26.0, 35.0],
  'LATAM': [-15.0, -60.0],
  'Latin America and Caribbean': [-15.0, -60.0],
  'North America': [45.0, -100.0],
  'Sub-Saharan Africa': [2.0, 20.0],
  'South Asia': [22.0, 80.0],
  'West Africa': [10.0, 0.0],
  'Northern and Western Europe': [53.0, 8.0]
};

export function getEventCoordinates(event) {
  if (!event) return null;
  const fullLoc = `${event.country || ''} ${event.region || ''} ${event.name || ''}`;

  // 1. Check specific city match
  for (const [city, coords] of Object.entries(cityCentroids)) {
    const regex = new RegExp(`\\b${city}\\b`, 'i');
    if (regex.test(fullLoc)) {
      return coords;
    }
  }

  // 2. Check country centroid
  const country = (event.country || '').trim();
  if (country && countryCentroids[country]) {
    return countryCentroids[country];
  }
  if (country) {
    const match = Object.keys(countryCentroids).find(c => country.toLowerCase().includes(c.toLowerCase()));
    if (match) return countryCentroids[match];
  }

  // 3. Check region fallback
  const region = (event.region || '').trim();
  if (region && regionCentroids[region]) {
    return regionCentroids[region];
  }

  return null;
}
