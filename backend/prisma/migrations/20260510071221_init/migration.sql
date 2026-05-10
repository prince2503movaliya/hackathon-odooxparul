-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('FOOD', 'CULTURE', 'ADVENTURE', 'NATURE', 'NIGHTLIFE', 'SHOPPING');

-- CreateEnum
CREATE TYPE "PackingCategory" AS ENUM ('CLOTHING', 'ELECTRONICS', 'DOCUMENTS', 'ESSENTIALS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "languagePreference" TEXT DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "targetBudget" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "costIndex" INTEGER NOT NULL DEFAULT 3,
    "popularityScore" INTEGER NOT NULL DEFAULT 50,
    "imageUrl" TEXT,
    "tagline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_stops" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "stopOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ActivityCategory" NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stop_activities" (
    "id" TEXT NOT NULL,
    "tripStopId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "scheduledTime" TIMESTAMP(3),
    "customNotes" TEXT,
    "day" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stop_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "transportCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accommodationCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mealCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activityCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "miscellaneousCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packing_items" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "category" "PackingCategory" NOT NULL DEFAULT 'ESSENTIALS',
    "isPacked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packing_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_notes" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "stopId" TEXT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_trips" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "shareSlug" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_destinations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "trips_userId_idx" ON "trips"("userId");

-- CreateIndex
CREATE INDEX "trips_visibility_idx" ON "trips"("visibility");

-- CreateIndex
CREATE INDEX "cities_country_idx" ON "cities"("country");

-- CreateIndex
CREATE INDEX "cities_region_idx" ON "cities"("region");

-- CreateIndex
CREATE INDEX "trip_stops_tripId_idx" ON "trip_stops"("tripId");

-- CreateIndex
CREATE INDEX "activities_cityId_idx" ON "activities"("cityId");

-- CreateIndex
CREATE INDEX "activities_category_idx" ON "activities"("category");

-- CreateIndex
CREATE INDEX "stop_activities_tripStopId_idx" ON "stop_activities"("tripStopId");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_tripId_key" ON "budgets"("tripId");

-- CreateIndex
CREATE INDEX "packing_items_tripId_idx" ON "packing_items"("tripId");

-- CreateIndex
CREATE INDEX "trip_notes_tripId_idx" ON "trip_notes"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_trips_tripId_key" ON "shared_trips"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_trips_shareSlug_key" ON "shared_trips"("shareSlug");

-- CreateIndex
CREATE INDEX "shared_trips_shareSlug_idx" ON "shared_trips"("shareSlug");

-- CreateIndex
CREATE INDEX "saved_destinations_userId_idx" ON "saved_destinations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_destinations_userId_cityId_key" ON "saved_destinations"("userId", "cityId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stop_activities" ADD CONSTRAINT "stop_activities_tripStopId_fkey" FOREIGN KEY ("tripStopId") REFERENCES "trip_stops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stop_activities" ADD CONSTRAINT "stop_activities_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_items" ADD CONSTRAINT "packing_items_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_notes" ADD CONSTRAINT "trip_notes_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_notes" ADD CONSTRAINT "trip_notes_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "trip_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_trips" ADD CONSTRAINT "shared_trips_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_destinations" ADD CONSTRAINT "saved_destinations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_destinations" ADD CONSTRAINT "saved_destinations_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
