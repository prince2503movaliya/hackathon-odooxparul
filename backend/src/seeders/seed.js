const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Cities
  const cities = [
    { name: 'Delhi', country: 'India', region: 'North', costIndex: 3, popularityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5', tagline: 'The heart of India' },
    { name: 'Mumbai', country: 'India', region: 'West', costIndex: 4, popularityScore: 98, imageUrl: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445', tagline: 'The city of dreams' },
    { name: 'Jaipur', country: 'India', region: 'North', costIndex: 2, popularityScore: 90, imageUrl: 'https://images.unsplash.com/photo-1502101779635-33c5d6472d6c', tagline: 'The Pink City' },
    { name: 'Goa', country: 'India', region: 'West', costIndex: 3, popularityScore: 94, imageUrl: 'https://images.unsplash.com/photo-1512780564367-407a040332ab', tagline: 'Beaches and Sunshine' },
    { name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 5, popularityScore: 99, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e', tagline: 'Neon lights and ancient shrines' },
    { name: 'Paris', country: 'France', region: 'Europe', costIndex: 5, popularityScore: 97, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', tagline: 'The City of Light' },
    { name: 'London', country: 'UK', region: 'Europe', costIndex: 4, popularityScore: 96, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad', tagline: 'History around every corner' },
    { name: 'Dubai', country: 'UAE', region: 'Middle East', costIndex: 5, popularityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', tagline: 'Luxury and Innovation' },
    { name: 'New York', country: 'USA', region: 'North America', costIndex: 5, popularityScore: 98, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', tagline: 'The Big Apple' },
    { name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 2, popularityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', tagline: 'Island of the Gods' },
  ];

  for (const city of cities) {
    const createdCity = await prisma.city.upsert({
      where: { id: `seed-${city.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: city,
      create: {
        id: `seed-${city.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...city,
      },
    });

    // Activities for each city
    const activities = {
      'Delhi': [
        { title: 'Chandni Chowk Food Tour', description: 'Taste the best street food.', category: 'FOOD', estimatedCost: 1500, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af' },
        { title: 'Red Fort Visit', description: 'Explore Mughal history.', category: 'CULTURE', estimatedCost: 500, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5' }
      ],
      'Tokyo': [
        { title: 'Shibuya Crossing Walk', description: 'Cross the world\'s busiest intersection.', category: 'NIGHTLIFE', estimatedCost: 0, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26' },
        { title: 'Sushi Making Class', description: 'Learn from a master chef.', category: 'FOOD', estimatedCost: 8000, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c' }
      ],
      'Paris': [
        { title: 'Eiffel Tower Picnic', description: 'Lunch with a view.', category: 'NATURE', estimatedCost: 2000, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e' },
        { title: 'Louvre Museum Tour', description: 'See the Mona Lisa.', category: 'CULTURE', estimatedCost: 1500, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a' }
      ],
      'Dubai': [
        { title: 'Burj Khalifa Observation', description: 'View from the world\'s tallest building.', category: 'ADVENTURE', estimatedCost: 4500, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59' },
        { title: 'Desert Safari', description: 'Dune bashing and dinner.', category: 'ADVENTURE', estimatedCost: 3500, durationMinutes: 360, imageUrl: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3' }
      ],
      'New York': [
        { title: 'Broadway Show', description: 'Experience world-class theater.', category: 'CULTURE', estimatedCost: 12000, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728' },
        { title: 'Central Park Bike Tour', description: 'Ride through the city\'s lungs.', category: 'NATURE', estimatedCost: 2500, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb' }
      ],
      'Bali': [
        { title: 'Ubud Rice Terrace Walk', description: 'Stunning green landscapes.', category: 'NATURE', estimatedCost: 500, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b' },
        { title: 'Surfing at Kuta', description: 'Catch some waves.', category: 'ADVENTURE', estimatedCost: 1500, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1512100356956-c1c4701a14e1' }
      ]
    };

    if (activities[city.name]) {
      for (const act of activities[city.name]) {
        await prisma.activity.upsert({
          where: { id: `seed-${city.name.toLowerCase()}-${act.title.toLowerCase().replace(/\s+/g, '-')}` },
          update: {},
          create: {
            id: `seed-${city.name.toLowerCase()}-${act.title.toLowerCase().replace(/\s+/g, '-')}`,
            cityId: createdCity.id,
            ...act,
          }
        });
      }
    }
  }

  // Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@traveloop.com' },
    update: {},
    create: {
      name: 'Traveloop Explorer',
      email: 'demo@traveloop.com',
      passwordHash: '$2a$10$YourHashedPasswordHere', // Use a real hash in production
      role: 'USER',
      currencyPreference: 'USD',
    },
  });

  // Demo Admin
  await prisma.user.upsert({
    where: { email: 'admin@traveloop.com' },
    update: {},
    create: {
      name: 'Platform Admin',
      email: 'admin@traveloop.com',
      passwordHash: '$2a$10$YourHashedPasswordHere',
      role: 'ADMIN',
    },
  });

  // Demo Trip
  const trip = await prisma.trip.upsert({
    where: { id: 'demo-trip-1' },
    update: {},
    create: {
      id: 'demo-trip-1',
      userId: demoUser.id,
      title: 'Global Exploration 2026',
      description: 'A grand tour of Paris, Tokyo, and Dubai.',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-25'),
      targetBudget: 15000,
      currency: 'USD',
      status: 'upcoming',
      stops: {
        create: [
          {
            cityId: 'seed-paris',
            arrivalDate: new Date('2026-06-01'),
            departureDate: new Date('2026-06-07'),
            stopOrder: 1,
            activities: {
              create: [
                {
                  activityId: 'seed-paris-louvre-museum-tour',
                  scheduledTime: new Date('2026-06-02T10:00:00Z'),
                  day: 2,
                }
              ]
            }
          },
          {
            cityId: 'seed-tokyo',
            arrivalDate: new Date('2026-06-08'),
            departureDate: new Date('2026-06-15'),
            stopOrder: 2,
            activities: {
              create: [
                {
                  activityId: 'seed-tokyo-sushi-making-class',
                  scheduledTime: new Date('2026-06-10T18:00:00Z'),
                  day: 3,
                }
              ]
            }
          }
        ]
      },
      packingItems: {
        create: [
          { itemName: 'Passport', category: 'DOCUMENTS', isPacked: true },
          { itemName: 'Camera', category: 'ELECTRONICS', isPacked: false },
          { itemName: 'Walking shoes', category: 'CLOTHING', isPacked: true },
        ]
      },
      notes: {
        create: [
          { title: 'Visa reminder', content: 'Apply for Japan visa by April.' }
        ]
      }
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
