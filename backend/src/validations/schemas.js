const { z } = require('zod');

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  languagePreference: z.string().optional(),
  currencyPreference: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

// ─────────────────────────────────────────────
// TRIP
// ─────────────────────────────────────────────

const tripBaseObject = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid start date'),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid end date'),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(),
  targetBudget: z.number().positive().optional(),
  currency: z.string().optional(),
  status: z.enum(['planning', 'upcoming', 'ongoing', 'completed']).optional(),
});

const createTripSchema = tripBaseObject.refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: 'End date must be on or after start date', path: ['endDate'] }
);

const updateTripSchema = tripBaseObject.partial();

// ─────────────────────────────────────────────
// STOP
// ─────────────────────────────────────────────

const createStopSchema = z.object({
  cityId: z.string().min(1),
  arrivalDate: z.string().refine((d) => !isNaN(Date.parse(d))),
  departureDate: z.string().refine((d) => !isNaN(Date.parse(d))),
  stopOrder: z.number().int().min(1).optional(),
}).refine(
  (data) => new Date(data.departureDate) >= new Date(data.arrivalDate),
  { message: 'Departure must be on or after arrival', path: ['departureDate'] }
);

const reorderStopsSchema = z.object({
  tripId: z.string().min(1),
  stops: z.array(z.object({ id: z.string(), stopOrder: z.number().int().min(1) })),
});

// ─────────────────────────────────────────────
// ACTIVITY
// ─────────────────────────────────────────────

const addStopActivitySchema = z.object({
  activityId: z.string().min(1),
  scheduledTime: z.string().optional(),
  customNotes: z.string().max(1000).optional(),
  day: z.number().int().min(1).optional(),
});

// ─────────────────────────────────────────────
// BUDGET
// ─────────────────────────────────────────────

const updateBudgetSchema = z.object({
  transportCost: z.number().min(0).optional(),
  accommodationCost: z.number().min(0).optional(),
  mealCost: z.number().min(0).optional(),
  activityCost: z.number().min(0).optional(),
  miscellaneousCost: z.number().min(0).optional(),
});

// ─────────────────────────────────────────────
// PACKING
// ─────────────────────────────────────────────

const createPackingItemSchema = z.object({
  itemName: z.string().min(1).max(200),
  category: z.enum(['CLOTHING', 'ELECTRONICS', 'DOCUMENTS', 'ESSENTIALS']).optional(),
  isPacked: z.boolean().optional(),
});

const updatePackingItemSchema = createPackingItemSchema.partial();

// ─────────────────────────────────────────────
// NOTE
// ─────────────────────────────────────────────

const createNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1),
  stopId: z.string().optional(),
});

const updateNoteSchema = createNoteSchema.partial();

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  languagePreference: z.string().optional(),
  currencyPreference: z.string().optional(),
});

// ─────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createTripSchema,
  updateTripSchema,
  createStopSchema,
  reorderStopsSchema,
  addStopActivitySchema,
  updateBudgetSchema,
  createPackingItemSchema,
  updatePackingItemSchema,
  createNoteSchema,
  updateNoteSchema,
  updateProfileSchema,
  paginationSchema,
};
