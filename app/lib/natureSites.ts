// Hand-picked list of incredible natural places around the world.
// Drives the Forest / Beach / Mountains / Others category search in the
// SearchBar — each activation drops a new random pin on the map.
//
// Each coordinate was checked one-by-one on Wikipedia / Google Earth so the
// dot lands on the actual feature, not a city name nearby.

export type NatureCategory = "forest" | "beach" | "mountains" | "others";

export interface NatureSite {
  name:     string;
  country:  string;
  lng:      number;
  lat:      number;
  category: NatureCategory;
  note?:    string;   // one-line "why it's remarkable"
}

export const NATURE_SITES: NatureSite[] = [
  // ── FORESTS ────────────────────────────────────────────────────────────
  { category: "forest", name: "Crooked Forest",           country: "Poland",         lng:  14.4819, lat:  53.2439, note: "~400 pines bent 90° at the base — origin unknown" },
  { category: "forest", name: "Avenue of the Baobabs",    country: "Madagascar",     lng:  44.4181, lat: -20.2506, note: "800-year-old baobabs line a dirt road" },
  { category: "forest", name: "Arashiyama Bamboo Grove",  country: "Japan",          lng: 135.6736, lat:  35.0175, note: "Sun-pierced Sagano bamboo with the 'soundscape of Japan'" },
  { category: "forest", name: "Hallerbos Bluebell Forest",country: "Belgium",        lng:   4.3833, lat:  50.7278, note: "Carpet of blue hyacinths under beech every April" },
  { category: "forest", name: "Dark Hedges",              country: "Northern Ireland",lng:  -6.3808, lat:  55.1344, note: "Intertwined 18th-century beech tunnel" },
  { category: "forest", name: "Redwood National Park",    country: "USA",            lng:-124.0046, lat:  41.2132, note: "Tallest trees on Earth — up to 115 m" },
  { category: "forest", name: "Jiuzhaigou Valley",        country: "China",          lng: 103.9156, lat:  33.2618, note: "Technicolor lakes inside old-growth fir forest" },
  { category: "forest", name: "Daintree Rainforest",      country: "Australia",      lng: 145.4200, lat: -16.2700, note: "180 million years old — oldest rainforest on Earth" },
  { category: "forest", name: "Tongass National Forest",  country: "Alaska, USA",    lng:-133.2614, lat:  57.7892, note: "Largest intact temperate rainforest" },
  { category: "forest", name: "Sequoia National Park",    country: "USA",            lng:-118.5658, lat:  36.4864, note: "Home of General Sherman — largest tree by volume" },
  { category: "forest", name: "Amazon Rainforest",        country: "Brazil",         lng: -62.2159, lat:  -3.4653, note: "Lungs of the planet, 10% of all known species" },
  { category: "forest", name: "Tsingy de Bemaraha",       country: "Madagascar",     lng:  44.7833, lat: -18.7000, note: "Razor-sharp limestone pinnacles above rainforest canopy" },
  { category: "forest", name: "Yakushima Cedar Forest",   country: "Japan",          lng: 130.5000, lat:  30.3500, note: "Jomon Sugi — a cedar up to 7,000 years old" },

  // ── BEACHES ────────────────────────────────────────────────────────────
  { category: "beach",  name: "Navagio (Shipwreck) Beach",country: "Greece",         lng:  20.6256, lat:  38.3263, note: "Rusted Panagiotis on white sand, ringed by 200-m cliffs" },
  { category: "beach",  name: "Glass Beach",              country: "California, USA",lng:-123.8130, lat:  39.4440, note: "Decades of tumbled sea-glass replace the sand" },
  { category: "beach",  name: "Pink Sands Beach",         country: "Bahamas",        lng: -76.6260, lat:  25.5067, note: "Crushed foraminifera shells dye the sand flamingo-pink" },
  { category: "beach",  name: "Whitehaven Beach",         country: "Australia",      lng: 149.0425, lat: -20.2833, note: "98% silica sand stays cool even at noon" },
  { category: "beach",  name: "Anse Source d'Argent",     country: "Seychelles",     lng:  55.8258, lat:  -4.3736, note: "Granite boulders sculpted smooth for millions of years" },
  { category: "beach",  name: "Cathedral Cove",           country: "New Zealand",    lng: 175.7889, lat: -36.8281, note: "Pohutukawa-framed arch carved by surf" },
  { category: "beach",  name: "Reynisfjara Black Sand",   country: "Iceland",        lng: -19.0650, lat:  63.4062, note: "Basalt columns + volcanic sand under Reynisdrangar sea stacks" },
  { category: "beach",  name: "Benagil Cave Beach",       country: "Portugal",       lng:  -8.4233, lat:  37.0900, note: "Circular skylight cathedral in a sea cave" },
  { category: "beach",  name: "Playa del Amor",           country: "Mexico",         lng:-105.5728, lat:  20.6978, note: "Hidden beach inside a crater on the Marietas Islands" },
  { category: "beach",  name: "Phra Nang Beach",          country: "Thailand",       lng:  98.8417, lat:   8.0039, note: "Limestone karsts plunge into turquoise Andaman Sea" },
  { category: "beach",  name: "Praia do Sancho",          country: "Brazil",         lng: -32.4456, lat:  -3.8547, note: "Fernando de Noronha — voted world's best beach multiple times" },
  { category: "beach",  name: "Hyams Beach",              country: "Australia",      lng: 150.6889, lat: -35.1100, note: "Guinness: whitest sand on Earth" },

  // ── MOUNTAINS ──────────────────────────────────────────────────────────
  { category: "mountains", name: "Mount Everest",         country: "Nepal / China",  lng:  86.9250, lat:  27.9881, note: "8,849 m — the highest point on Earth" },
  { category: "mountains", name: "Matterhorn",            country: "Switzerland / Italy",lng: 7.6586, lat:  45.9763, note: "Near-perfect pyramid with four razor ridges" },
  { category: "mountains", name: "Mount Fuji",            country: "Japan",          lng: 138.7274, lat:  35.3606, note: "Symmetrical stratovolcano, sacred since antiquity" },
  { category: "mountains", name: "Mount Kilimanjaro",     country: "Tanzania",       lng:  37.3556, lat:  -3.0674, note: "Highest free-standing mountain in the world" },
  { category: "mountains", name: "Denali",                country: "Alaska, USA",    lng:-151.0070, lat:  63.0692, note: "Greatest base-to-peak rise of any land mountain" },
  { category: "mountains", name: "Huashan",               country: "China",          lng: 110.0853, lat:  34.4873, note: "Plank walk in the sky, 2,154 m of sheer granite" },
  { category: "mountains", name: "Cerro Torre",           country: "Argentina / Chile",lng: -73.1006, lat: -49.2929, note: "Near-vertical granite spire crowned with a rime mushroom" },
  { category: "mountains", name: "Vinicunca (Rainbow Mountain)",country:"Peru",      lng: -71.3030, lat: -13.8700, note: "Mineral layers banded red, turquoise, gold, white" },
  { category: "mountains", name: "Reinebringen",          country: "Norway",         lng:  13.0887, lat:  67.9332, note: "Lofoten viewpoint — serrated peaks above Arctic fjords" },
  { category: "mountains", name: "Trolltunga",            country: "Norway",         lng:   6.7400, lat:  60.1240, note: "Flat slab jutting 700 m above Lake Ringedalsvatnet" },
  { category: "mountains", name: "Aoraki / Mount Cook",   country: "New Zealand",    lng: 170.1419, lat: -43.5951, note: "'Cloud piercer' — 3,724 m of glaciated rock" },
  { category: "mountains", name: "Mount Roraima",         country: "Venezuela",      lng: -60.7622, lat:   5.1456, note: "2-billion-year-old tepui; inspired Conan Doyle's Lost World" },
  { category: "mountains", name: "Torres del Paine",      country: "Chile",          lng: -73.0000, lat: -51.0048, note: "Three granite torres over the Patagonian steppe" },
  { category: "mountains", name: "K2",                    country: "Pakistan / China",lng:  76.5152, lat:  35.8820, note: "'Savage Mountain' — 8,611 m, deadliest of the 8000ers" },

  // ── OTHERS (anomalies / wonders) ───────────────────────────────────────
  { category: "others", name: "Salar de Uyuni",           country: "Bolivia",        lng: -67.4891, lat: -20.1338, note: "World's largest salt flat — a 10,000 km² mirror when wet" },
  { category: "others", name: "Grand Prismatic Spring",   country: "Wyoming, USA",   lng:-110.8383, lat:  44.5251, note: "Thermophilic bacteria paint the rings rainbow" },
  { category: "others", name: "Danakil Depression",       country: "Ethiopia",       lng:  40.3000, lat:  14.2417, note: "Permanent lava lakes at Erta Ale, 125 m below sea level" },
  { category: "others", name: "Socotra Island",           country: "Yemen",          lng:  53.8237, lat:  12.4634, note: "Dragon-blood trees — a third of plants exist nowhere else" },
  { category: "others", name: "Giant's Causeway",         country: "Northern Ireland",lng: -6.5116, lat:  55.2408, note: "40,000 interlocking basalt columns from a paleogene eruption" },
  { category: "others", name: "The Wave",                 country: "Arizona, USA",   lng:-112.0069, lat:  37.0030, note: "190-million-year-old Jurassic sandstone ripples" },
  { category: "others", name: "Pamukkale",                country: "Turkey",         lng:  29.1198, lat:  37.9203, note: "Calcite travertine terraces — 'cotton castle'" },
  { category: "others", name: "Fly Geyser",               country: "Nevada, USA",    lng:-119.3313, lat:  40.8605, note: "Accidental 1964 geothermal well now a 3-m mineral mound" },
  { category: "others", name: "Son Doong Cave",           country: "Vietnam",        lng: 106.2876, lat:  17.4557, note: "Largest cave passage on Earth — has its own jungle + river" },
  { category: "others", name: "Chocolate Hills",          country: "Philippines",    lng: 124.1632, lat:   9.8291, note: "1,200+ symmetric limestone cones that turn brown in dry season" },
  { category: "others", name: "Moeraki Boulders",         country: "New Zealand",    lng: 170.8267, lat: -45.3454, note: "Near-spherical 2-m septarian concretions on a beach" },
  { category: "others", name: "Lake Hillier",             country: "Australia",      lng: 123.2029, lat: -34.0957, note: "Bubblegum-pink lake — cause still debated" },
  { category: "others", name: "Marble Caves",             country: "Chile",          lng: -72.6167, lat: -46.6500, note: "6,000 years of waves carved Patagonian marble" },
  { category: "others", name: "Zhangjiajie Pillars",      country: "China",          lng: 110.4347, lat:  29.3238, note: "Quartzite sandstone towers that inspired Pandora in Avatar" },
  { category: "others", name: "Cappadocia Fairy Chimneys",country: "Turkey",         lng:  34.8289, lat:  38.6431, note: "Volcanic tuff sculpted into mushroom spires" },
  { category: "others", name: "Plitvice Lakes",           country: "Croatia",        lng:  15.5820, lat:  44.8654, note: "16 terraced lakes stacked in a travertine staircase" },
  { category: "others", name: "Aurora Borealis — Tromsø", country: "Norway",         lng:  18.9560, lat:  69.6496, note: "One of the best places on Earth to see the Northern Lights" },
  { category: "others", name: "Wave Rock",                country: "Australia",      lng: 118.8972, lat: -32.4444, note: "2.7-billion-year-old granite curl, 14 m high" },
];

// Per-category color used both for the dot and for the popup accent bar.
export const NATURE_COLORS: Record<NatureCategory, string> = {
  forest:    "#16a34a",   // evergreen
  beach:     "#38bdf8",   // caribbean blue
  mountains: "#a78bfa",   // alpine violet
  others:    "#fbbf24",   // amber — anomaly
};

// Per-category fly-to zoom — close enough to actually see the feature.
export const NATURE_CATEGORY_ZOOM: Record<NatureCategory, number> = {
  forest:    13.5,  // see individual canopy texture
  beach:     13.0,  // see coastline + ocean waves
  mountains: 13.5,  // see individual ridges and peaks
  others:    12.5,  // anomalies vary in size — slightly wider
};
// Fallback for "any" category
export const NATURE_FLY_ZOOM = 13.0;

// Pick a random site from a category, skipping any already on the map.
// Cycles: when every site in the category is used, we reset and start over
// (so the user can keep tapping forever).
export function pickRandomNatureSite(
  category: NatureCategory,
  alreadyPlaced: Iterable<string>,
): NatureSite {
  const placedSet  = new Set(alreadyPlaced);
  const inCategory = NATURE_SITES.filter(s => s.category === category);
  const unused     = inCategory.filter(s => !placedSet.has(s.name));
  const pool       = unused.length > 0 ? unused : inCategory;
  return pool[Math.floor(Math.random() * pool.length)];
}
