# Church App

Fullstack monorepo — Express + MongoDB backend with Next.js frontend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express 4 · TypeScript · Mongoose · JWT · Nodemailer · Socket.IO · Zod |
| Frontend | Next.js 16 · React 19 · Tailwind CSS v4 |
| Database | MongoDB 7 |

## Quick Start

### Prerequisites

- Node.js 20+
- npm 9+
- Docker & Docker Compose (for containerized deployment)

### Local Development (No Docker)

```bash
# Install all dependencies (root + frontend + backend)
npm run install:all

# Start both dev servers concurrently
npm run dev
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### Production (Docker)

```bash
# Build and start all services
docker compose up --build
```

This starts:
- **Backend API** on port 5000
- **Frontend** on port 3000
- **MongoDB** on port 27017

### Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in the values (see `.env.example` for all available keys)
3. **Never commit `.env`** — it's in `.gitignore`

## Project Structure

```
church-app/
├── backend/          # Express + Mongoose API
│   ├── src/
│   │   ├── app/      # Modules, middlewares, builders
│   │   ├── config/   # Environment config
│   │   ├── DB/       # Database seeders
│   │   ├── errors/   # Error handling
│   │   ├── helpers/  # JWT, email, socket, pagination
│   │   ├── routes/   # API route definitions
│   │   ├── shared/   # Shared utilities
│   │   ├── types/    # TypeScript type definitions
│   │   └── util/     # Crypto, OTP utilities
│   └── Dockerfile
├── frontend/         # Next.js 16 App Router
│   ├── src/app/      # Pages and layouts
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json      # Root monorepo scripts
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run build` | Build both apps for production |
| `npm run start` | Start both apps in production mode |
| `npm run install:all` | Install deps for root, frontend, and backend |
| `npm run lint` | Run linters on both apps |
| `npm run test` | Run backend tests |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user/register` | Register a new user |
| GET | `/api/v1/user/profile` | Get user profile (auth required) |
| PATCH | `/api/v1/user/profile` | Update user profile (auth required) |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/forget-password` | Request password reset OTP |
| POST | `/api/v1/auth/verify-email` | Verify email with OTP |
| POST | `/api/v1/auth/resend-verify-email` | Resend verification email |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| POST | `/api/v1/auth/change-password` | Change password (auth required) |
| POST | `/api/v1/feedback` | Submit user feedback |
| GET | `/api/v1/feedback` | Get all feedback (admin only) |
