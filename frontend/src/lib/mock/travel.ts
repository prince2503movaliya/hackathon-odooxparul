// Mock travel data service. Simulates async API for cities, trips, activities.
import { apiClient } from "@/lib/apiClient";

export type City = {
  id: string;
  name: string;
  country: string;
  region: string;
  image: string;
  popularity: number; // 0-100
  costIndex: number; // 1-5
  tagline: string;
};

export type Activity = {
  id: string;
  title: string;
  city: string;
  category: "Food" | "Culture" | "Adventure" | "Nature" | "Nightlife" | "Shopping";
  durationHours: number;
  cost: number;
  image: string;
  description: string;
};

export type ItineraryActivity = Activity & {
  time: string; // HH:mm
  day: number;
};

export type CityStop = {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  startDate: string;
  endDate: string;
  activities: ItineraryActivity[];
};

export type Trip = {
  id: string;
  name: string;
  description: string;
  cover: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TripStatus;
  stops: CityStop[];
  notes: TripNote[];
  packing: PackingItem[];
};

export type TripNote = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  day?: number;
};

export type TripStatus = "planning" | "upcoming" | "ongoing" | "completed";

export type PackingItem = {
  id: string;
  name: string;
  category: "Clothing" | "Electronics" | "Documents" | "Essentials";
  packed: boolean;
};

const CITY_IMG = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=900&q=70`;

// Indian cities mock data
export const CITIES: City[] = [
  { id: "c1", name: "Delhi", country: "India", region: "Asia", image: CITY_IMG("photo-1526401485004-1402b354191b"), popularity: 95, costIndex: 3, tagline: "Capital of India" },
  { id: "c2", name: "Mumbai", country: "India", region: "Asia", image: CITY_IMG("photo-1517487881594-2787f5c6b6c1"), popularity: 93, costIndex: 4, tagline: "City of dreams" },
  { id: "c3", name: "Jaipur", country: "India", region: "Asia", image: CITY_IMG("photo-1502101779635-33c5d6472d6c"), popularity: 88, costIndex: 2, tagline: "Pink City" },
  { id: "c4", name: "Goa", country: "India", region: "Asia", image: CITY_IMG("photo-1528618329322-81c2be4280c9"), popularity: 90, costIndex: 3, tagline: "Beach paradise" },
  { id: "c5", name: "Kolkata", country: "India", region: "Asia", image: CITY_IMG("photo-1505584676734-77e8c2e582ab"), popularity: 85, costIndex: 2, tagline: "Cultural capital" },
  { id: "c6", name: "Kerala", country: "India", region: "Asia", image: CITY_IMG("photo-1543322600-5629248bb0d7"), popularity: 87, costIndex: 2, tagline: "Backwaters and spices" },
];

const A_IMG = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=70`;

// Indian activities mock data
export const ACTIVITIES: Activity[] = [
  { id: "a1", title: "Street food tour", city: "Delhi", category: "Food", durationHours: 3, cost: 30, image: A_IMG("photo-1504673540415-4c037c36f0f9"), description: "Explore Delhi's bustling markets and culinary stalls." },
  { id: "a2", title: "Heritage walk", city: "Jaipur", category: "Culture", durationHours: 2, cost: 20, image: A_IMG("photo-1518674660708-a7432a96c774"), description: "Visit forts, palaces, and the Pink City’s bazaars." },
  { id: "a3", title: "Beach day", city: "Goa", category: "Nature", durationHours: 5, cost: 10, image: A_IMG("photo-1507525427145-55f565ddf0bc"), description: "Relax on Goa’s golden sands and enjoy water sports." },
  { id: "a4", title: "Backwater cruise", city: "Kerala", category: "Adventure", durationHours: 4, cost: 40, image: A_IMG("photo-1508771449898-0d6c90325df8"), description: "Sail through Kerala’s scenic backwaters with a traditional houseboat." },
  { id: "a5", title: "Cultural performance", city: "Kolkata", category: "Culture", durationHours: 2, cost: 25, image: A_IMG("photo-1496519213170-5c47e7a2f0c1"), description: "Enjoy a traditional Bengali dance and music showcase." },
  { id: "a6", title: "Sunset at Marine Drive", city: "Mumbai", category: "Nightlife", durationHours: 2, cost: 0, image: A_IMG("photo-1485118201108-fd1b20a13993"), description: "Watch the sunset over the Arabian Sea at Mumbai's iconic promenade." },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Local persistence layer
const STORAGE_KEY = "traveloop:trips:v1";
const isClient = () => typeof window !== "undefined";

function readTrips(): Trip[] {
  if (!isClient()) return seedTrips();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = seedTrips();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Trip[];
  } catch {
    return seedTrips();
  }
}

function writeTrips(trips: Trip[]) {
  if (!isClient()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

function seedTrips(): Trip[] {
  return [
    {
      id: "t1",
      name: "North India Tour",
      description: "Exploring the historic sites of Delhi and the Pink City.",
      cover: CITY_IMG("photo-1526401485004-1402b354191b"),
      startDate: "2026-06-10",
      endDate: "2026-06-20",
      budget: 1500,
      status: "upcoming",
      stops: [
        {
          id: "s1", cityId: "c1", cityName: "Delhi", country: "India",
          startDate: "2026-06-10", endDate: "2026-06-15",
          activities: [
            { ...ACTIVITIES[0], time: "19:00", day: 1 },
          ],
        },
        {
          id: "s2", cityId: "c3", cityName: "Jaipur", country: "India",
          startDate: "2026-06-15", endDate: "2026-06-20",
          activities: [
            { ...ACTIVITIES[1], time: "10:00", day: 1 },
          ],
        },
      ],
      notes: [
        { id: "n1", title: "Flight info", content: "Arrival at IGI Terminal 3.", createdAt: "2026-05-01T10:00:00Z" },
      ],
      packing: defaultPacking(),
    },
    {
      id: "t2",
      name: "Coastal getaway",
      description: "Beaches of Goa and the bustle of Mumbai.",
      cover: CITY_IMG("photo-1517487881594-2787f5c6b6c1"),
      startDate: "2026-07-04",
      endDate: "2026-07-12",
      budget: 2000,
      status: "planning",
      stops: [
        { id: "s3", cityId: "c4", cityName: "Goa", country: "India", startDate: "2026-07-04", endDate: "2026-07-08", activities: [{ ...ACTIVITIES[2], time: "16:00", day: 1 }] },
        { id: "s4", cityId: "c2", cityName: "Mumbai", country: "India", startDate: "2026-07-08", endDate: "2026-07-12", activities: [{ ...ACTIVITIES[5], time: "18:00", day: 1 }] },
      ],
      notes: [],
      packing: defaultPacking(),
    },
  ];
}

function defaultPacking(): PackingItem[] {
  return [
    { id: "p1", name: "Passport", category: "Documents", packed: true },
    { id: "p2", name: "Travel insurance", category: "Documents", packed: false },
    { id: "p3", name: "Phone charger", category: "Electronics", packed: false },
    { id: "p4", name: "Adapter", category: "Electronics", packed: false },
    { id: "p5", name: "T-shirts (5)", category: "Clothing", packed: false },
    { id: "p6", name: "Toiletries", category: "Essentials", packed: false },
  ];
}

const id = () => Math.random().toString(36).slice(2, 10);

export const tripService = {
  async list(): Promise<Trip[]> {
    const data = await apiClient<any[]>("/trips");
    return data.map(mapTrip);
  },
  async get(tripId: string): Promise<Trip | undefined> {
    const data = await apiClient<any>(`/trips/${tripId}`);
    return mapTrip(data);
  },
  async create(input: any): Promise<Trip> {
    const backendInput = {
      title: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      targetBudget: input.budget,
      coverImage: input.cover,
      status: "planning",
    };
    const data = await apiClient<any>("/trips", {
      method: "POST",
      body: JSON.stringify(backendInput),
    });
    return mapTrip(data);
  },
  async update(tripId: string, patch: Partial<Trip>): Promise<Trip | undefined> {
    const backendPatch: any = {};
    if (patch.name) backendPatch.title = patch.name;
    if (patch.description !== undefined) backendPatch.description = patch.description;
    if (patch.startDate) backendPatch.startDate = patch.startDate;
    if (patch.endDate) backendPatch.endDate = patch.endDate;
    if (patch.budget !== undefined) backendPatch.targetBudget = patch.budget;
    if (patch.cover) backendPatch.coverImage = patch.cover;
    if (patch.status) backendPatch.status = patch.status;

    const data = await apiClient<any>(`/trips/${tripId}`, {
      method: "PUT",
      body: JSON.stringify(backendPatch),
    });
    return mapTrip(data);
  },
  async remove(tripId: string): Promise<void> {
    await apiClient(`/trips/${tripId}`, { method: "DELETE" });
  },
  async addStop(tripId: string, city: City, dates: { startDate: string; endDate: string }): Promise<Trip | undefined> {
    await apiClient(`/trips/${tripId}/stops`, {
      method: "POST",
      body: JSON.stringify({
        cityId: city.id,
        arrivalDate: dates.startDate,
        departureDate: dates.endDate,
      }),
    });
    return this.get(tripId);
  },
  async reorderStops(tripId: string, stops: CityStop[]) {
    await apiClient("/trips/stops/reorder", {
      method: "PATCH",
      body: JSON.stringify({
        tripId,
        stops: stops.map((s, i) => ({ id: s.id, stopOrder: i + 1 })),
      }),
    });
  },
  async addActivity(tripId: string, stopId: string, activity: ItineraryActivity) {
    await apiClient(`/cities/stops/${stopId}/activities`, {
      method: "POST",
      body: JSON.stringify({
        activityId: activity.id,
        scheduledTime: activity.time,
        day: activity.day,
      }),
    });
    return this.get(tripId);
  },
  async removeStop(tripId: string, stopId: string) {
    await apiClient(`/trips/${tripId}/stops/${stopId}`, { method: "DELETE" });
    return this.get(tripId);
  },
  // Other methods would follow similar patterns
  async setPacking(tripId: string, packing: PackingItem[]) {
    // In a real app, we might sync the whole list or individual items.
    // For this hackathon, we'll assume we add new items if they don't have IDs
    // or update existing ones.
    return this.get(tripId);
  },
  async addPackingItem(tripId: string, data: any) {
    await apiClient(`/trips/${tripId}/packing`, {
      method: "POST",
      body: JSON.stringify({
        itemName: data.name,
        category: data.category.toUpperCase(),
        isPacked: data.packed || false,
      }),
    });
    return this.get(tripId);
  },
  async togglePackingItem(tripId: string, itemId: string, isPacked: boolean) {
    await apiClient(`/trips/${tripId}/packing/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ isPacked }),
    });
  },
  async removePackingItem(tripId: string, itemId: string) {
    await apiClient(`/trips/${tripId}/packing/${itemId}`, { method: "DELETE" });
  },
  async addNote(tripId: string, data: any) {
    await apiClient(`/trips/${tripId}/notes`, {
      method: "POST",
      body: JSON.stringify({
        title: data.title,
        content: data.content,
      }),
    });
    return this.get(tripId);
  },
  async removeNote(tripId: string, noteId: string) {
    await apiClient(`/trips/${tripId}/notes/${noteId}`, { method: "DELETE" });
  },
};

function mapTrip(t: any): Trip {
  return {
    id: t.id,
    name: t.title,
    description: t.description || "",
    cover: t.coverImage || CITY_IMG("photo-1493976040374-85c8e12f0c0e"),
    startDate: t.startDate ? (typeof t.startDate === 'string' ? t.startDate.split("T")[0] : new Date(t.startDate).toISOString().split("T")[0]) : "",
    endDate: t.endDate ? (typeof t.endDate === 'string' ? t.endDate.split("T")[0] : new Date(t.endDate).toISOString().split("T")[0]) : "",
    budget: t.targetBudget || 0,
    status: (t.status as TripStatus) || "planning",
    stops: (t.stops || []).map((s: any) => ({
      id: s.id,
      cityId: s.cityId,
      cityName: s.city?.name || "",
      country: s.city?.country || "",
      startDate: s.arrivalDate ? (typeof s.arrivalDate === 'string' ? s.arrivalDate.split("T")[0] : new Date(s.arrivalDate).toISOString().split("T")[0]) : "",
      endDate: s.departureDate ? (typeof s.departureDate === 'string' ? s.departureDate.split("T")[0] : new Date(s.departureDate).toISOString().split("T")[0]) : "",
      activities: (s.activities || []).map((sa: any) => ({
        ...sa.activity,
        time: sa.scheduledTime || "10:00",
        day: sa.day || 1,
      })),
    })),
    notes: (t.notes || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      createdAt: n.createdAt,
      day: n.day,
    })),
    packing: (t.packingItems || []).map((p: any) => ({
      id: p.id,
      name: p.itemName || p.name || "",
      // Normalize DB uppercase category ("CLOTHING") to title-case ("Clothing")
      category: p.category
        ? (p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase()) as PackingItem["category"]
        : "Essentials",
      packed: p.isPacked ?? p.packed ?? false,
    })),
  };
}


export const cityService = {
  async list(): Promise<City[]> {
    const data = await apiClient<any[]>("/cities");
    return data.map(c => ({
      id: c.id,
      name: c.name,
      country: c.country,
      region: c.region,
      image: c.imageUrl || CITY_IMG("photo-1514282401047-d79a71a590e8"),
      popularity: c.popularityScore,
      costIndex: c.costIndex,
      tagline: c.tagline || "",
    }));
  },
  async search(q: string, region?: string): Promise<City[]> {
    const data = await apiClient<any[]>("/cities", { params: { q, region: region === "All" ? "" : region } });
    return data.map(c => ({
      id: c.id,
      name: c.name,
      country: c.country,
      region: c.region,
      image: c.imageUrl || CITY_IMG("photo-1514282401047-d79a71a590e8"),
      popularity: c.popularityScore,
      costIndex: c.costIndex,
      tagline: c.tagline || "",
    }));
  },
};

export const activityService = {
  async list(): Promise<Activity[]> {
    const data = await apiClient<any[]>("/cities/activities");
    return data.map(a => ({
      id: a.id,
      title: a.title,
      city: a.city?.name || "",
      category: a.category.charAt(0) + a.category.slice(1).toLowerCase() as any,
      durationHours: a.durationMinutes / 60,
      cost: a.estimatedCost,
      image: a.imageUrl || A_IMG("photo-1528127269322-539801943592"),
      description: a.description || "",
    }));
  },
  async search(filters: { q?: string; category?: string; maxCost?: number; maxHours?: number }): Promise<Activity[]> {
    const params: any = { q: filters.q };
    if (filters.category && filters.category !== "All") params.category = filters.category.toUpperCase();
    if (filters.maxCost) params.maxCost = filters.maxCost.toString();
    if (filters.maxHours) params.maxHours = filters.maxHours.toString();

    const data = await apiClient<any[]>("/cities/activities", { params });
    return data.map(a => ({
      id: a.id,
      title: a.title,
      city: a.city?.name || "",
      category: a.category.charAt(0) + a.category.slice(1).toLowerCase() as any,
      durationHours: a.durationMinutes / 60,
      cost: a.estimatedCost,
      image: a.imageUrl || A_IMG("photo-1528127269322-539801943592"),
      description: a.description || "",
    }));
  },
};

// Budget breakdown estimator — uses real activity costs from DB
export function estimateBudget(trip: Trip) {
  const days = Math.max(
    1,
    trip.startDate && trip.endDate
      ? Math.round((+new Date(trip.endDate) - +new Date(trip.startDate)) / 86400000)
      : 1
  );

  // Real activity costs from the itinerary
  const activitiesCost = trip.stops.reduce(
    (sum, s) => sum + s.activities.reduce((a, x) => a + (x.cost || 0), 0),
    0
  );

  // Estimate remaining categories based on number of stops and days
  const stayPerNight = 1200; // ₹1200/night per stop
  const stays = trip.stops.reduce((sum, s) => {
    const nights = s.startDate && s.endDate
      ? Math.max(1, Math.round((+new Date(s.endDate) - +new Date(s.startDate)) / 86400000))
      : Math.max(1, Math.floor(days / Math.max(1, trip.stops.length)));
    return sum + nights * stayPerNight;
  }, 0) || trip.stops.length * stayPerNight;

  const transportBase = trip.stops.length > 1 ? trip.stops.length * 800 : 400;
  const food = days * 400; // ₹400/day

  const total = Math.round(stays + transportBase + activitiesCost + food);

  return {
    days,
    total,
    breakdown: [
      { name: "Stay",        value: Math.round(stays),          color: "var(--chart-1)" },
      { name: "Transport",   value: Math.round(transportBase),  color: "var(--chart-2)" },
      { name: "Activities",  value: Math.round(activitiesCost), color: "var(--chart-3)" },
      { name: "Food",        value: Math.round(food),           color: "var(--chart-4)" },
    ],
    dailyAverage: Math.round(total / days),
  };
}
