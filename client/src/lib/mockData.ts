// Chef's Table Festival — Mock Data Layer
// Windows: Thu Dinner | Fri Lunch+Dinner | Sat Lunch+Dinner | Sun Brunch
// Chef-first hierarchy: chef photo, name, cuisine pills, expandable menu detail

export const TIME_WINDOWS = [
  { id: "thu-dinner",  label: "Thursday Dinner",   date: "Aug 13", type: "dinner", sort: 0 },
  { id: "fri-lunch",   label: "Friday Lunch",       date: "Aug 14", type: "lunch",  sort: 1 },
  { id: "fri-dinner",  label: "Friday Dinner",      date: "Aug 14", type: "dinner", sort: 2 },
  { id: "sat-lunch",   label: "Saturday Lunch",     date: "Aug 15", type: "lunch",  sort: 3 },
  { id: "sat-dinner",  label: "Saturday Dinner",    date: "Aug 15", type: "dinner", sort: 4 },
  { id: "sun-brunch",  label: "Sunday Brunch",      date: "Aug 16", type: "brunch", sort: 5 },
];

// Chef portrait photos — Unsplash editorial portraits
export const CHEF_PHOTOS: Record<string, string> = {
  "Thomas Keller":       "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80",
  "Nobu Matsuhisa":      "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&q=80",
  "Elena Arzak":         "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&q=80",
  "Sean Brock":          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80",
  "Daniel Humm":         "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&q=80",
  "Dominique Crenn":     "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80",
  "Enrique Olvera":      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  "René Redzepi":        "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&q=80",
  "Francis Mallmann":    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  "Yotam Ottolenghi":    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  "Alice Waters":        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80",
  "Yoshihiro Narisawa":  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
  "Alain Ducasse":       "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
  "Heston Blumenthal":   "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80",
  "Virgilio Martínez":   "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
  "Massimo Bottura":     "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
  "Gaggan Anand":        "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80",
  "Anne-Sophie Pic":     "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&q=80",
};

// Fallback chef portrait
export const DEFAULT_CHEF_PHOTO = "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80";

export interface Restaurant {
  id: string;
  name: string;           // Venue/experience name (secondary)
  chef: string;           // PRIMARY identity
  chefTitle: string;      // e.g. "Executive Chef & Owner"
  cuisine: string;        // Short cuisine label
  accolades: string;
  chefPhoto: string;      // Portrait of the chef
  heroPhoto: string;      // Food/venue hero image
  description: string;
  tags: string[];         // Cuisine category pills
  menuHighlights: string[]; // 3-4 signature dishes shown in expanded view
  menuStyle: string;      // e.g. "10-course tasting menu" or "À la carte"
  highDemand?: boolean;
}

export const RESTAURANTS: Restaurant[] = [
  {
    id: "r01",
    name: "Provisions",
    chef: "Thomas Keller",
    chefTitle: "Chef-Owner, The French Laundry",
    cuisine: "American Contemporary",
    accolades: "3 Michelin Stars",
    chefPhoto: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-3-Pvj2i65KVu8ozLJzPv6V5x.webp",
    description: "A celebration of American terroir — hyper-seasonal ingredients from Park City's surrounding farms, prepared with classical French technique and quiet restraint.",
    tags: ["Tasting Menu", "Wine Pairing", "Seasonal"],
    menuHighlights: ["Oysters & Pearls — sabayon of pearl tapioca", "Snake River Farm Wagyu, bone marrow & truffle", "Butter-poached Maine lobster, sweet corn velouté", "Valrhona chocolate sphere, salted caramel"],
    menuStyle: "9-course tasting menu",
    highDemand: true,
  },
  {
    id: "r02",
    name: "Sakura Omakase",
    chef: "Nobu Matsuhisa",
    chefTitle: "Founder, Nobu Restaurants",
    cuisine: "Japanese Omakase",
    accolades: "2 Michelin Stars",
    chefPhoto: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-1-DqLXTk7aTbPboFVpD8BLaK.webp",
    description: "Twelve courses of pristine Japanese craftsmanship. Each piece of nigiri is a conversation between the chef and the sea.",
    tags: ["Omakase", "Sake Pairing", "Intimate"],
    menuHighlights: ["Bluefin toro nigiri, yuzu kosho", "Black cod miso — Nobu's signature dish", "Wagyu tataki, ponzu & crispy shallots", "Yuzu sorbet, matcha financier"],
    menuStyle: "12-course omakase",
    highDemand: true,
  },
  {
    id: "r03",
    name: "Altitude",
    chef: "Elena Arzak",
    chefTitle: "Head Chef, Arzak",
    cuisine: "Modern Basque",
    accolades: "3 Michelin Stars",
    chefPhoto: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-2-FKqgoGa5vD4K4ggHypcias.webp",
    description: "The mountains of Utah meet the Basque coast. Arzak's signature avant-garde technique applied to Utah's wild game and mountain herbs.",
    tags: ["Avant-Garde", "Tasting Menu", "Theatrical"],
    menuHighlights: ["Txangurro spider crab, saffron foam", "Venison loin, pine ash & mountain herbs", "Kokotxas al pil-pil, smoked paprika oil", "Burnt Basque cheesecake, wild berry coulis"],
    menuStyle: "8-course tasting menu",
    highDemand: true,
  },
  {
    id: "r04",
    name: "The Hearth",
    chef: "Sean Brock",
    chefTitle: "Chef & Author, Heritage",
    cuisine: "Southern Heritage",
    accolades: "James Beard Award",
    chefPhoto: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-3-Pvj2i65KVu8ozLJzPv6V5x.webp",
    description: "An ode to the American South — heirloom grains, heritage pork, and the slow fire of wood-burning hearths.",
    tags: ["Heritage", "Family Style", "Whiskey Pairing"],
    menuHighlights: ["Anson Mills grits, aged cheddar & country ham", "Whole-roasted heritage hog, crackling & sorghum", "Cornbread, cultured butter & sorghum molasses", "Banana pudding, Nilla wafer & bourbon caramel"],
    menuStyle: "Family-style sharing",
  },
  {
    id: "r05",
    name: "Lumière",
    chef: "Daniel Humm",
    chefTitle: "Chef-Owner, Eleven Madison Park",
    cuisine: "Plant-Forward Fine Dining",
    accolades: "3 Michelin Stars",
    chefPhoto: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-2-FKqgoGa5vD4K4ggHypcias.webp",
    description: "Plant-forward luxury — Humm's celebrated plant-based tasting menu, reimagined for the altitude and seasons of Park City.",
    tags: ["Plant-Based", "Tasting Menu", "Wine Pairing"],
    menuHighlights: ["Celery root shawarma, tahini & pomegranate", "Lavender honey glazed beet, pistachio & dill", "Mushroom Wellington, black truffle jus", "Coconut & mango pavlova, passion fruit curd"],
    menuStyle: "11-course plant-based tasting",
    highDemand: true,
  },
  {
    id: "r06",
    name: "Cinder",
    chef: "Dominique Crenn",
    chefTitle: "Chef-Owner, Atelier Crenn",
    cuisine: "Poetic Cuisine",
    accolades: "3 Michelin Stars",
    chefPhoto: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-1-DqLXTk7aTbPboFVpD8BLaK.webp",
    description: "Each course is a poem. Crenn's signature narrative cuisine — dishes that tell stories of memory, place, and emotion.",
    tags: ["Narrative", "Tasting Menu", "Theatrical"],
    menuHighlights: ["'The Sea' — oyster, sea urchin & kelp broth", "'The Forest' — porcini, pine & smoked butter", "'The Farm' — heritage chicken, truffle & hay", "'The Garden' — strawberry, rose & elderflower"],
    menuStyle: "10-course narrative tasting",
  },
  {
    id: "r07",
    name: "Mesa Alta",
    chef: "Enrique Olvera",
    chefTitle: "Chef-Owner, Pujol",
    cuisine: "Modern Mexican",
    accolades: "World's 50 Best",
    chefPhoto: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-3-Pvj2i65KVu8ozLJzPv6V5x.webp",
    description: "Ancient Mexican tradition elevated to its highest expression. Mole negro aged 1,000 days. Corn from Oaxacan milpas.",
    tags: ["Mexican", "Mezcal Pairing", "Heritage"],
    menuHighlights: ["Mole madre — 1,000-day aged mole negro", "Tostada de atún, avocado & chipotle", "Elote en vaso, mayonesa & cotija", "Tres leches, cajeta & toasted coconut"],
    menuStyle: "À la carte & sharing",
  },
  {
    id: "r08",
    name: "Nordic Table",
    chef: "René Redzepi",
    chefTitle: "Chef-Owner, Noma",
    cuisine: "New Nordic",
    accolades: "4× World's Best Restaurant",
    chefPhoto: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-2-FKqgoGa5vD4K4ggHypcias.webp",
    description: "Foraging meets fine dining. Redzepi's team spent weeks in Utah's mountains sourcing ingredients that have never appeared on a menu before.",
    tags: ["Foraging", "Tasting Menu", "Experimental"],
    menuHighlights: ["Wild mushroom broth, foraged herbs & pine oil", "Fermented barley, smoked butter & trout roe", "Reindeer tartare, pickled elderberry & rye crisps", "Cloudberry granita, birch sap & cream"],
    menuStyle: "12-course forager's menu",
    highDemand: true,
  },
  {
    id: "r09",
    name: "Ember & Oak",
    chef: "Francis Mallmann",
    chefTitle: "Chef & Author, Seven Fires",
    cuisine: "Open Fire",
    accolades: "Latin America's Best",
    chefPhoto: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-3-Pvj2i65KVu8ozLJzPv6V5x.webp",
    description: "The primal pleasure of fire. Mallmann's seven fires method applied to Utah's finest beef, lamb, and root vegetables.",
    tags: ["Open Fire", "Patagonian", "Communal"],
    menuHighlights: ["Whole-roasted Wagyu rib, chimichurri & salsa criolla", "Lamb asado, herb crust & wood-roasted peppers", "Infiernillo vegetables — beet, potato & onion", "Dulce de leche crepes, toasted almonds"],
    menuStyle: "Communal fire feast",
  },
  {
    id: "r10",
    name: "Saffron",
    chef: "Yotam Ottolenghi",
    chefTitle: "Chef & Author, Ottolenghi",
    cuisine: "Middle Eastern",
    accolades: "James Beard Award",
    chefPhoto: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-1-DqLXTk7aTbPboFVpD8BLaK.webp",
    description: "The abundance of the Levant — pomegranate, sumac, preserved lemon, and the generosity of a shared table.",
    tags: ["Middle Eastern", "Vegetable-Forward", "Sharing"],
    menuHighlights: ["Burnt aubergine, tahini & pomegranate molasses", "Lamb kofta, harissa yogurt & flatbread", "Roasted cauliflower, golden raisins & pine nuts", "Knafeh — shredded pastry, cheese & rose syrup"],
    menuStyle: "Mezze sharing table",
  },
  {
    id: "r11",
    name: "Terroir",
    chef: "Alice Waters",
    chefTitle: "Founder, Chez Panisse",
    cuisine: "California Farm-to-Table",
    accolades: "James Beard Lifetime Achievement",
    chefPhoto: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-2-FKqgoGa5vD4K4ggHypcias.webp",
    description: "The original farm-to-table philosophy, applied to Utah's extraordinary growing season. Simple, honest, transcendent.",
    tags: ["Farm-to-Table", "Organic", "Seasonal"],
    menuHighlights: ["Heirloom tomato salad, burrata & basil oil", "Wood-roasted chicken, garden herbs & aioli", "Grilled stone fruit, almond cream & honey", "Warm chocolate cake, crème fraîche"],
    menuStyle: "4-course prix fixe",
  },
  {
    id: "r12",
    name: "Kaiseki Ryu",
    chef: "Yoshihiro Narisawa",
    chefTitle: "Chef-Owner, Narisawa",
    cuisine: "Kaiseki",
    accolades: "Asia's 50 Best",
    chefPhoto: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-1-DqLXTk7aTbPboFVpD8BLaK.webp",
    description: "The ancient Japanese art of kaiseki — a sequence of small courses that traces the arc of a season from first light to last ember.",
    tags: ["Kaiseki", "Sake Pairing", "Ceremonial"],
    menuHighlights: ["Sakizuke — seasonal amuse, dashi broth", "Hassun — mountain vegetables, pickled plum", "Yakimono — charcoal-grilled A5 Wagyu", "Mizugashi — seasonal fruit & matcha mochi"],
    menuStyle: "Traditional 8-course kaiseki",
    highDemand: true,
  },
  {
    id: "r13",
    name: "Brasserie Sauvage",
    chef: "Alain Ducasse",
    chefTitle: "Chef, 21 Michelin Stars",
    cuisine: "Classic French",
    accolades: "21 Michelin Stars",
    chefPhoto: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-2-FKqgoGa5vD4K4ggHypcias.webp",
    description: "The grand tradition of French cuisine — butter, cream, and the confidence of a kitchen that has nothing to prove.",
    tags: ["Classic French", "Wine Pairing", "Grand Tradition"],
    menuHighlights: ["Soupe de truffes noires — black truffle soup", "Sole meunière, beurre noisette & capers", "Poulet rôti, pommes sarladaises & jus", "Tarte Tatin, crème fraîche & Calvados"],
    menuStyle: "Classic brasserie à la carte",
  },
  {
    id: "r14",
    name: "Smoke & Salt",
    chef: "Heston Blumenthal",
    chefTitle: "Chef-Owner, The Fat Duck",
    cuisine: "Molecular Gastronomy",
    accolades: "3 Michelin Stars",
    chefPhoto: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-3-Pvj2i65KVu8ozLJzPv6V5x.webp",
    description: "Science in service of pleasure. Blumenthal's signature multi-sensory experience — sound, scent, and surprise at every course.",
    tags: ["Molecular", "Multi-Sensory", "Theatrical"],
    menuHighlights: ["Sound of the Sea — seafood, edible sand & headphones", "Snail porridge, Jabugo ham & shaved fennel", "Mock turtle soup — Mad Hatter's tea party", "BFG Dream — whipped cream & edible bubbles"],
    menuStyle: "Multi-sensory tasting experience",
  },
  {
    id: "r15",
    name: "The Cellar",
    chef: "Massimo Bottura",
    chefTitle: "Chef-Owner, Osteria Francescana",
    cuisine: "Modern Italian",
    accolades: "3 Michelin Stars",
    chefPhoto: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
    heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028381200/CbsvRYgwFL3gPoKMATBV2R/event-card-2-FKqgoGa5vD4K4ggHypcias.webp",
    description: "Italy reimagined — Bottura's playful, intellectual deconstruction of Italian culinary memory. Five ages of Parmigiano Reggiano.",
    tags: ["Modern Italian", "Conceptual", "Wine Pairing"],
    menuHighlights: ["Five ages of Parmigiano Reggiano", "An eel swimming up the Po River", "Oops! I dropped the lemon tart", "Camouflage — hare in the woods"],
    menuStyle: "10-course conceptual tasting",
    highDemand: true,
  },
];

// ── Per-window chef subsets ─────────────────────────────────────────────────
// Each window features a unique, curated subset of chefs in a distinct order
// so switching days feels like a fresh lineup, not a static list.
export const WINDOW_CHEFS: Record<string, string[]> = {
  "thu-dinner": ["r01", "r08", "r03", "r15", "r06", "r14", "r04", "r11", "r07", "r12"],
  "fri-lunch":  ["r10", "r11", "r04", "r07", "r13", "r05", "r09", "r02", "r06", "r15", "r01"],
  "fri-dinner": ["r02", "r05", "r08", "r01", "r12", "r13", "r03", "r09", "r10", "r14", "r07", "r06"],
  "sat-lunch":  ["r09", "r07", "r11", "r14", "r02", "r04", "r08", "r13", "r15", "r10"],
  "sat-dinner": ["r03", "r12", "r06", "r08", "r15", "r01", "r05", "r14", "r09", "r11", "r02"],
  "sun-brunch": ["r11", "r10", "r04", "r07", "r05", "r13", "r06", "r01", "r03"],
};

// Required minimum and maximum selections per window
export const REQUIRED_RANKINGS = 3;
export const MAX_RANKINGS = 8;

// ── Cuisine / Venue Wildcard Options ────────────────────────────────────────
// These are NOT named-chef slots. They represent cuisine categories or venue
// features for events yet to be announced. Shown in a distinct section below
// the chef grid. Attendees can rank these alongside named chefs.
export interface CuisineOption {
  id: string;
  windowId: string;        // Which dining window(s) this applies to
  label: string;           // e.g. "Japanese Omakase"
  category: string;        // Broader group: "Cuisine" | "Venue Feature" | "Experience"
  description: string;     // One-line teaser for the unannounced event
  icon: string;            // Emoji icon for quick visual scanning
  tags: string[];          // Searchable tags
}

export const CUISINE_OPTIONS: CuisineOption[] = [
  // Thursday Dinner
  { id: "co-thu-d-1", windowId: "thu-dinner",  label: "Wood-Fire & Open Flame",       category: "Cuisine",        description: "A yet-to-be-announced chef specialising in live-fire cooking over local hardwoods.",           icon: "🔥", tags: ["Open Fire", "Rustic", "Smoke"] },
  { id: "co-thu-d-2", windowId: "thu-dinner",  label: "Elevated Steakhouse",          category: "Venue Feature",  description: "Prime dry-aged cuts, tableside preparations, and a deep American whiskey program.",             icon: "🥩", tags: ["Steakhouse", "Whiskey", "Classic"] },
  { id: "co-thu-d-3", windowId: "thu-dinner",  label: "Modern Mexican",               category: "Cuisine",        description: "Regional Mexican technique and rare heritage ingredients — mezcal pairings throughout.",         icon: "🌮", tags: ["Mexican", "Mezcal", "Heritage"] },

  // Friday Lunch
  { id: "co-fri-l-1", windowId: "fri-lunch",   label: "Alpine Charcuterie & Cheese",  category: "Experience",     description: "A curated mountain spread — artisan cured meats, Utah cheeses, and natural wine.",              icon: "🧀", tags: ["Charcuterie", "Natural Wine", "Casual"] },
  { id: "co-fri-l-2", windowId: "fri-lunch",   label: "Coastal Seafood Raw Bar",      category: "Cuisine",        description: "Live oysters, crudo, and whole fish — a chef-driven raw bar concept TBA.",                     icon: "🦪", tags: ["Seafood", "Raw Bar", "Light"] },
  { id: "co-fri-l-3", windowId: "fri-lunch",   label: "Garden Brunch Concept",        category: "Venue Feature",  description: "An outdoor garden setting with a vegetable-forward menu and herb-infused cocktails.",            icon: "🌿", tags: ["Vegetarian", "Garden", "Brunch"] },

  // Friday Dinner
  { id: "co-fri-d-1", windowId: "fri-dinner",  label: "Omakase Counter Experience",   category: "Cuisine",        description: "An intimate 8-seat counter — chef TBA — serving a single nightly omakase.",                   icon: "🍣", tags: ["Omakase", "Japanese", "Intimate"] },
  { id: "co-fri-d-2", windowId: "fri-dinner",  label: "Whole Animal Feast",           category: "Experience",     description: "Communal tables, whole-roasted heritage animals, and a family-style celebration of craft.",     icon: "🍖", tags: ["Communal", "Heritage", "Feast"] },
  { id: "co-fri-d-3", windowId: "fri-dinner",  label: "Sommelier-Led Wine Dinner",    category: "Venue Feature",  description: "A six-course dinner built entirely around a rare vertical — chef and winery TBA.",              icon: "🍷", tags: ["Wine", "Pairing", "Vertical"] },

  // Saturday Lunch
  { id: "co-sat-l-1", windowId: "sat-lunch",   label: "Street Food Market",           category: "Experience",     description: "A curated pop-up market featuring local vendors and surprise guest chef stalls.",               icon: "🏮", tags: ["Street Food", "Market", "Casual"] },
  { id: "co-sat-l-2", windowId: "sat-lunch",   label: "Ramen & Noodle Bar",           category: "Cuisine",        description: "House-made noodles, rich broths, and a rotating roster of toppings — chef TBA.",               icon: "🍜", tags: ["Ramen", "Noodles", "Japanese"] },
  { id: "co-sat-l-3", windowId: "sat-lunch",   label: "Mediterranean Mezze",          category: "Cuisine",        description: "Shared plates, wood-roasted vegetables, and a long table in the mountain air.",                icon: "🫒", tags: ["Mediterranean", "Shared", "Vegetable"] },

  // Saturday Dinner
  { id: "co-sat-d-1", windowId: "sat-dinner",  label: "Grand Tasting Gala",           category: "Experience",     description: "The signature closing dinner — multiple chefs TBA, black tie optional, full orchestral score.",  icon: "✨", tags: ["Gala", "Multi-Chef", "Black Tie"] },
  { id: "co-sat-d-2", windowId: "sat-dinner",  label: "Peruvian Ceviche & Pisco",     category: "Cuisine",        description: "Coastal Peruvian flavours elevated to fine dining — leche de tigre, tiradito, and more.",       icon: "🍋", tags: ["Peruvian", "Seafood", "Pisco"] },
  { id: "co-sat-d-3", windowId: "sat-dinner",  label: "Wagyu Kaiseki Pairing",        category: "Cuisine",        description: "A Japanese-inspired progression built around A5 Wagyu — sake and whisky pairings.",            icon: "🥢", tags: ["Wagyu", "Kaiseki", "Japanese"] },

  // Sunday Brunch
  { id: "co-sun-b-1", windowId: "sun-brunch",  label: "Pastry & Viennoiserie Brunch", category: "Experience",     description: "A leisurely morning of laminated pastries, single-origin coffee, and soft eggs — chef TBA.",    icon: "🥐", tags: ["Pastry", "Coffee", "Leisurely"] },
  { id: "co-sun-b-2", windowId: "sun-brunch",  label: "Farm Breakfast Table",         category: "Venue Feature",  description: "Long-table farm breakfast in the meadow — local eggs, house-cured meats, fresh bread.",         icon: "🌄", tags: ["Farm", "Rustic", "Outdoor"] },
  { id: "co-sun-b-3", windowId: "sun-brunch",  label: "Dim Sum & Tea Ceremony",       category: "Cuisine",        description: "Traditional dim sum service with a curated pu-erh and oolong tea pairing — chef TBA.",         icon: "🍵", tags: ["Dim Sum", "Tea", "Chinese"] },
];

// Add-on / Sponsored Experiences — shown below chef selections per window
export interface AddOnExperience {
  id: string;
  windowId: string;       // Which dining window this add-on belongs to
  title: string;
  subtitle: string;
  sponsor: string;        // Sponsor or host name
  description: string;
  photo: string;
  requiresRSVP: boolean;  // If true, show RSVP modal on selection
  rsvpLabel: string;      // CTA label inside RSVP modal
  badge: string;          // e.g. "VIP Only" | "Sponsored" | "Limited"
  capacity: string;       // e.g. "50 guests"
}

export const ADD_ON_EXPERIENCES: AddOnExperience[] = [
  {
    id: "addon-fri-dinner-afterparty",
    windowId: "fri-dinner",
    title: "VIP Afterparty — Rooftop at The Montage",
    subtitle: "Friday Night · 10 PM – 2 AM",
    sponsor: "Presented by Dom Pérignon",
    description: "An exclusive late-night gathering for Tier 1 & 2 guests on the Montage's rooftop terrace. Live DJ, Champagne service, and surprise chef appearances. Separate RSVP required — capacity strictly limited to 50 guests.",
    photo: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    requiresRSVP: true,
    rsvpLabel: "Request My Spot",
    badge: "VIP Only",
    capacity: "50 guests",
  },
];

// ── CheckIn compatibility exports ────────────────────────────────────────────
export interface RosterAttendee {
  id: string;
  name: string;
  tier: number;
  email: string;
  checkedIn: boolean;
  checkedInAt?: string;
  squadId?: string;
  aliases?: string[];
  /** Free-text allergy / dietary restriction notes entered by the attendee */
  allergies?: string[];
  allergyNotes?: string;
}

export const MOCK_ROSTER: RosterAttendee[] = [
  { id: "a01", name: "Sarah Chen",    tier: 1, email: "sarah.chen@example.com",    checkedIn: true,  checkedInAt: "6:02 PM", aliases: ["Sara Chen"],
    allergies: ["Tree Nuts", "Shellfish"], allergyNotes: "Severe tree nut allergy — carries EpiPen. Shellfish causes hives." },
  { id: "a02", name: "Bill Foster",   tier: 1, email: "bill.foster@example.com",   checkedIn: true,  checkedInAt: "6:05 PM", aliases: ["William Foster"] },
  { id: "a03", name: "Liz Park",      tier: 2, email: "liz.park@example.com",      checkedIn: true,  checkedInAt: "6:11 PM", aliases: ["Elizabeth Park"],
    allergies: ["Gluten"], allergyNotes: "Celiac disease — strict gluten-free required, cross-contamination is a concern." },
  { id: "a04", name: "Marcus Webb",   tier: 2, email: "marcus.webb@example.com",   checkedIn: false,
    allergies: ["Dairy"], allergyNotes: "Lactose intolerant — avoid all dairy including butter and cream sauces." },
  { id: "a05", name: "Priya Nair",    tier: 1, email: "priya.nair@example.com",    checkedIn: false,
    allergies: ["Peanuts", "Soy"], allergyNotes: "Peanut allergy is anaphylactic. Soy sensitivity — prefer to avoid." },
  { id: "a06", name: "James Okafor",  tier: 3, email: "james.okafor@example.com",  checkedIn: false },
  { id: "a07", name: "Sofia Reyes",   tier: 2, email: "sofia.reyes@example.com",   checkedIn: false, squadId: "Squad A" },
  { id: "a08", name: "Daniel Kim",    tier: 1, email: "daniel.kim@example.com",    checkedIn: false, squadId: "Squad A",
    allergies: ["Eggs"], allergyNotes: "Egg allergy — affects sauces and pastries. Not anaphylactic but causes GI distress." },
  { id: "a09", name: "Olivia Grant",  tier: 3, email: "olivia.grant@example.com",  checkedIn: false },
  { id: "a10", name: "Raj Patel",     tier: 2, email: "raj.patel@example.com",     checkedIn: false,
    allergies: ["Shellfish", "Fish"], allergyNotes: "Strict vegetarian — no seafood of any kind. Religious dietary practice." },
  { id: "a11", name: "Hannah Brooks", tier: 3, email: "hannah.brooks@example.com", checkedIn: false },
  { id: "a12", name: "Tyler Young",   tier: 3, email: "tyler.young@example.com",   checkedIn: false },
  { id: "a13", name: "Nina Vasquez",  tier: 2, email: "nina.vasquez@example.com",  checkedIn: false,
    allergies: ["Mustard"], allergyNotes: "Mustard allergy — present in many vinaigrettes and marinades. Moderate reaction." },
  { id: "a14", name: "Chris Lawson",  tier: 1, email: "chris.lawson@example.com",  checkedIn: false },
  { id: "a15", name: "Mei Lin",       tier: 2, email: "mei.lin@example.com",       checkedIn: false },
];

/** Simple fuzzy name match — returns 0–1 confidence score */
export function fuzzyMatchName(query: string, name: string): number {
  const q = query.toLowerCase().trim();
  const n = name.toLowerCase().trim();
  if (n === q) return 1;
  if (n.includes(q) || q.includes(n)) return 0.9;
  const qParts = q.split(/\s+/);
  const nParts = n.split(/\s+/);
  const shared = qParts.filter((p) => nParts.some((np) => np.startsWith(p) || p.startsWith(np)));
  return shared.length / Math.max(qParts.length, nParts.length);
}

// ── Admin dashboard compatibility exports ─────────────────────────────────────
export const MOCK_ALLOCATION_RESULTS = {
  matched: 1842,
  unmatched: 47,
  firstChoice: 1204,
  matchQuality: 87,
  byWindow: TIME_WINDOWS.map((w, i) => ({
    windowId: w.id,
    windowLabel: w.label,
    matched: 280 + i * 12,
    unmatched: 8 - i,
    firstChoicePct: 68 + i * 2,
  })),
};
