# 🌍 Traveloop – Personalized Travel Planning Platform

Traveloop is a modern full-stack travel planning platform that enables users to create personalized multi-city itineraries, manage travel budgets, discover destinations and activities, organize packing checklists, and share travel experiences with others.

The platform is designed with a scalable architecture, responsive UI, secure backend APIs, and a relational database-driven system to deliver a seamless travel planning experience.

---

# ✨ Features

## 🔐 Authentication & Security
- User Registration & Login
- JWT Authentication
- Refresh Token Support
- Forgot/Reset Password
- Protected Routes
- Role-Based Access Control (RBAC)
- Secure Password Hashing using bcrypt

---

## 🧳 Trip Management
- Create, Edit, Delete Trips
- Multi-City Travel Planning
- Add Travel Stops
- Reorder Stops
- Upload Trip Cover Images
- Public & Private Trips

---

## 🗺️ Itinerary Builder
- Day-wise Travel Planning
- Multi-City Timeline Management
- Activity Scheduling
- Interactive Itinerary Workflow
- Timeline & Calendar Views

---

## 💰 Budget & Analytics
- Automatic Cost Calculation
- Budget Breakdown by Category
- Daily Spending Insights
- Dynamic Currency Support
- Budget Analytics Charts
- Over-Budget Alerts

---

## 🏙️ City & Activity Discovery
- Search Cities
- Search Activities
- Category & Cost Filters
- Destination Recommendations
- Add Activities to Itinerary

---

## 🎒 Packing Checklist
- Add/Remove Checklist Items
- Mark Items as Packed
- Category-Based Organization
- Progress Tracking

---

## 📝 Notes & Journal
- Trip Notes
- Stop-Specific Notes
- Timestamped Travel Journal Entries

---

## 🌐 Sharing System
- Public Shareable Itineraries
- Read-Only Public View
- Copy Shared Trips
- Social Sharing Support

---

## 📊 Admin Dashboard
- User Analytics
- Popular Destinations
- Trip Statistics
- Engagement Monitoring
- Activity Insights

---

# 🛠️ Tech Stack

## Frontend
- React.js
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Recharts
- React Query / TanStack Query

---

## Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt
- Multer
- Redis (Optional)

---

## DevOps & Tools
- Git & GitHub
- Swagger/OpenAPI
- Postman

---

# 📁 Project Structure

## Frontend

```bash
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── routes/
│   ├── store/
│   ├── context/
│   ├── utils/
│   ├── types/
│   ├── assets/
│   └── styles/
│
└── public/
```

---

## Backend

```bash
backend/
│
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middlewares/
│   ├── validations/
│   ├── utils/
│   ├── config/
│   ├── database/
│   ├── seeders/
│   ├── uploads/
│   └── app.js
│
├── prisma/
├── package.json
└── .env
```

---

# 🗄️ Database Design

## Core Entities
- Users
- Trips
- Cities
- Trip Stops
- Activities
- Stop Activities
- Budgets
- Packing Items
- Trip Notes
- Shared Trips
- Saved Destinations
- Refresh Tokens

---

# ⚙️ Core Functional Modules

| Module | Description |
|--------|-------------|
| Authentication | Secure user access and session management |
| Dashboard | Personalized travel overview |
| Trip Planner | Multi-city itinerary management |
| Budget System | Expense tracking and analytics |
| Activity Discovery | Explore destinations and activities |
| Packing Checklist | Travel item organization |
| Notes System | Travel journaling and reminders |
| Sharing System | Public itinerary sharing |
| Admin Dashboard | Analytics and monitoring |

---

# 🔗 REST API Modules

## Auth APIs
- Register
- Login
- Logout
- Refresh Token
- Forgot Password
- Reset Password

---

## Trip APIs
- Create Trip
- Update Trip
- Delete Trip
- Fetch Trips

---

## Itinerary APIs
- Add Stops
- Reorder Stops
- Add Activities
- Generate Timeline

---

## Budget APIs
- Cost Calculation
- Budget Analytics
- Expense Reports

---

## Packing APIs
- Add Checklist Items
- Update Packing Status

---

## Notes APIs
- Create Notes
- Update Notes
- Delete Notes

---

## Sharing APIs
- Generate Public Share Links
- Copy Shared Trips

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Secure API Middleware
- Rate Limiting
- CORS Protection
- Helmet Security
- Input Validation & Sanitization
- SQL Injection Protection

---

# 🎨 UI/UX Highlights

- Fully Responsive Design
- Clean SaaS-Style Interface
- Modern Dashboard Layout
- Interactive Timeline Planner
- Dynamic Analytics Visualization
- Mobile-Friendly Experience
- Elegant Navigation System
- Accessibility-Focused Components

---

# 🚀 Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/hackathon-odooxparul.git

cd traveloop
```

---

# 💻 Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# ⚙️ Backend Setup

```bash
cd backend

npm install
```

---

## 🔑 Configure Environment Variables

Create `.env` inside backend folder:

```env
PORT=5000

DATABASE_URL=postgresql://postgres:password@localhost:5432/traveloop

JWT_SECRET=your_jwt_secret

JWT_REFRESH_SECRET=your_refresh_secret

NODE_ENV=development
```

---

## 🗃️ Run Database Migration

```bash
npx prisma migrate dev
```

---

## 🌱 Seed Demo Data

```bash
npx prisma db seed
```

---

## ▶️ Start Backend Server

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

# 📡 API Documentation

Swagger/OpenAPI documentation available at:

```bash
http://localhost:5000/api-docs
```

---

# 📱 Responsive Support

Traveloop is optimized for:
- Desktop
- Tablet
- Mobile Devices

---

# 📈 Future Improvements

- AI Travel Recommendations
- Real-Time Collaboration
- Weather Integration
- Hotel & Flight APIs
- Interactive Maps
- Push Notifications
- Offline Support
- Multi-Language Support

---

# 🎯 Project Goals

Traveloop focuses on:
- Personalized travel experiences
- Efficient itinerary management
- Better budget visibility
- Clean user experience
- Scalable full-stack architecture
- Real-world SaaS standards

---

# 👨‍💻 Contributors

### Team Traveloop

- Frontend Development
- Backend Development
- Database Design
- UI/UX Design
- API Integration

---

# 📄 License

This project is developed for:
- Educational Purposes
- Hackathons
- Learning & Portfolio Development

---

# ⭐ Highlights

✅ Multi-City Itinerary Planning  
✅ Database-Driven Architecture  
✅ Production-Grade Backend APIs  
✅ Responsive SaaS UI  
✅ Dynamic Budget Analytics  
✅ Public Trip Sharing  
✅ Secure Authentication  
✅ Relational Database Design  
✅ Full Frontend-Backend Integration  
✅ Scalable System Architecture
