generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                 String             @id @default(cuid())
  name               String
  email              String             @unique
  passwordHash       String
  profilePhoto       String?
  role               Role               @default(USER)
  languagePreference String?            @default("en")
  currencyPreference String?            @default("USD")
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
  refreshTokens      RefreshToken[]
  savedDestinations  SavedDestination[]
  trips              Trip[]

  @@index([email])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

model Trip {
  id           String        @id @default(cuid())
  userId       String
  title        String
  description  String?
  coverImage   String?
  startDate    DateTime
  endDate      DateTime
  visibility   Visibility    @default(PRIVATE)
  targetBudget Float?
  currency     String        @default("USD")
  status       String        @default("planning")
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  budget       Budget?
  packingItems PackingItem[]
  shared       SharedTrip?
  notes        TripNote[]
  stops        TripStop[]
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([visibility])
  @@map("trips")
}

model City {
  id                String             @id @default(cuid())
  name              String
  country           String
  region            String
  costIndex         Int                @default(3)
  popularityScore   Int                @default(50)
  imageUrl          String?
  tagline           String?
  createdAt         DateTime           @default(now())
  activities        Activity[]
  savedDestinations SavedDestination[]
  tripStops         TripStop[]

  @@index([country])
  @@index([region])
  @@map("cities")
}

model TripStop {
  id            String         @id @default(cuid())
  tripId        String
  cityId        String
  arrivalDate   DateTime
  departureDate DateTime
  stopOrder     Int
  createdAt     DateTime       @default(now())
  activities    StopActivity[]
  notes         TripNote[]
  city          City           @relation(fields: [cityId], references: [id])
  trip          Trip           @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@index([tripId])
  @@map("trip_stops")
}

model Activity {
  id              String           @id @default(cuid())
  cityId          String
  title           String
  description     String?
  category        ActivityCategory
  estimatedCost   Float            @default(0)
  durationMinutes Int              @default(60)
  imageUrl        String?
  createdAt       DateTime         @default(now())
  city            City             @relation(fields: [cityId], references: [id])
  stopActivities  StopActivity[]

  @@index([cityId])
  @@index([category])
  @@map("activities")
}

model StopActivity {
  id            String    @id @default(cuid())
  tripStopId    String
  activityId    String
  scheduledTime DateTime?
  customNotes   String?
  day           Int?
  createdAt     DateTime  @default(now())
  activity      Activity  @relation(fields: [activityId], references: [id])
  tripStop      TripStop  @relation(fields: [tripStopId], references: [id], onDelete: Cascade)

  @@index([tripStopId])
  @@map("stop_activities")
}

model Budget {
  id                String   @id @default(cuid())
  tripId            String   @unique
  transportCost     Float    @default(0)
  accommodationCost Float    @default(0)
  mealCost          Float    @default(0)
  activityCost      Float    @default(0)
  miscellaneousCost Float    @default(0)
  totalCost         Float    @default(0)
  updatedAt         DateTime @updatedAt
  trip              Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@map("budgets")
}

model PackingItem {
  id        String          @id @default(cuid())
  tripId    String
  itemName  String
  category  PackingCategory @default(ESSENTIALS)
  isPacked  Boolean         @default(false)
  createdAt DateTime        @default(now())
  trip      Trip            @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@index([tripId])
  @@map("packing_items")
}

model TripNote {
  id        String    @id @default(cuid())
  tripId    String
  stopId    String?
  title     String?
  content   String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  stop      TripStop? @relation(fields: [stopId], references: [id])
  trip      Trip      @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@index([tripId])
  @@map("trip_notes")
}

model SharedTrip {
  id        String   @id @default(cuid())
  tripId    String   @unique
  shareSlug String   @unique
  isPublic  Boolean  @default(true)
  createdAt DateTime @default(now())
  trip      Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@index([shareSlug])
  @@map("shared_trips")
}

model SavedDestination {
  id        String   @id @default(cuid())
  userId    String
  cityId    String
  createdAt DateTime @default(now())
  city      City     @relation(fields: [cityId], references: [id])
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, cityId])
  @@index([userId])
  @@map("saved_destinations")
}

enum Role {
  USER
  ADMIN
}

enum Visibility {
  PRIVATE
  PUBLIC
}

enum ActivityCategory {
  FOOD
  CULTURE
  ADVENTURE
  NATURE
  NIGHTLIFE
  SHOPPING
}

enum PackingCategory {
  CLOTHING
  ELECTRONICS
  DOCUMENTS
  ESSENTIALS
}
