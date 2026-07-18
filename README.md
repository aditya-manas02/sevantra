<div align="center">
  <img src="apps/web/public/file.svg" alt="Sevantra Logo" width="80" height="80" />
  <h1 align="center">Sevantra</h1>
  <p align="center">
    <strong>The Modern Civic Engagement Platform</strong>
  </p>
  <p align="center">
    Bridging the gap between citizens, NGOs, and local governance to build better communities today.
  </p>
</div>

<hr />

## 🌟 Overview

Sevantra is a comprehensive civic engagement platform designed to empower citizens and organizations to collaborate effectively. Whether you are a citizen looking to volunteer for local events, or a non-profit organization striving to broaden your impact, Sevantra provides the tools you need to connect, act, and transform your community.

## 🚀 Features

- **Modern Authentication Flow:** Secure Email/Password registration with OTP verification, alongside seamless 1-click **Google OAuth** integration, presented in a premium split-screen UI.
- **Organization Management:** NGOs, Corporate entities, and Community Groups can register, get verified, and manage their members.
- **Event Discovery & Registration:** Users can discover local community events, register as volunteers, and check in.
- **Admin Command Center:** A powerful, tabbed dashboard with real-time analytics for platform administrators to monitor growth, manage users, and verify organizations.
- **Real-Time Data:** Live dynamic statistics on the landing page powered by the robust backend.
- **Internationalization (i18n):** Support for multiple languages to ensure maximum accessibility across communities.

## 🛠️ Tech Stack

Sevantra is built as a highly scalable **Turborepo** monorepo, ensuring rapid development and seamless code sharing between the frontend and backend.

### Frontend (`apps/web`)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Framer Motion (Micro-animations, Glassmorphism, Dynamic UI)
- **State Management:** Zustand + React Query (`@tanstack/react-query`)
- **Forms & Validation:** React Hook Form + Zod
- **Authentication:** JWT + `@react-oauth/google`

### Backend (`apps/api`)
- **Runtime:** Node.js + Express.js
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Hosted on Neon)
- **Authentication:** JWT Cookies, `bcrypt`, `google-auth-library`
- **Email:** Nodemailer (OTP and notifications)

### Shared (`packages/shared` & `packages/database`)
- **Shared Code:** Zod validation schemas shared natively between the API and Web.
- **Database:** Centralized Prisma client and schema.

## 🏗️ Project Structure

```bash
sevantra/
├── apps/
│   ├── api/            # Express.js REST API backend
│   └── web/            # Next.js frontend web application
├── packages/
│   ├── database/       # Prisma ORM schema and client
│   ├── eslint-config/  # Shared ESLint configurations
│   ├── shared/         # Shared TypeScript types and Zod schemas
│   └── typescript-config/# Shared TS configurations
└── pnpm-workspace.yaml # Turborepo & pnpm workspace config
```

## 💻 Local Development Setup

To get this project running on your local machine, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v9+)
- A PostgreSQL database string (e.g., via Neon)

### 1. Clone the repository
```bash
git clone https://github.com/aditya-manas02/sevantra.git
cd sevantra
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Variables
Create `.env` files in the necessary directories based on the `.env.example` configurations.

**`packages/database/.env` & `apps/api/.env`**
```env
DATABASE_URL="postgres://username:password@host/database"
JWT_SECRET="your_super_secret_key"
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
```

**`apps/web/.env`**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
```

### 4. Database Setup
Push the Prisma schema to your database to set up the tables:
```bash
cd packages/database
pnpm prisma db push
```

### 5. Run the Application
Start the development servers for both the frontend and backend simultaneously using Turborepo:
```bash
pnpm dev
```
- **Frontend** will run on `http://localhost:3000`
- **Backend API** will run on `http://localhost:4000`

## 🌍 Deployment

Sevantra is fully optimized for continuous deployment:
- **Frontend (`apps/web`):** Deployed on [Vercel](https://vercel.com).
- **Backend (`apps/api`):** Deployed as a web service on [Render](https://render.com).

*(Don't forget to configure your production environment variables and update your Google OAuth Authorized URIs!)*

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve Sevantra, please fork the repository, create a new branch for your feature or bugfix, and submit a Pull Request.

---
*Developed with ❤️ to empower communities.*
