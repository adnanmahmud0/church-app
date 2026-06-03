# Project Review — Church App

**Date:** 2026-06-04  
**Scope:** Full codebase review (frontend + backend)

---

## Summary

The project is a **church application** built with an Express + Mongoose backend and a Next.js 16 frontend. The backend follows a clean modular architecture (routes → controllers → services → models) with Zod validation, JWT auth, and email-based OTP verification. The frontend is currently stock Next.js boilerplate.

Overall the backend architecture is solid and well-organized. However, several security gaps, performance issues, and dead dependencies were found and addressed.

---

## Issues Found & Fixed

### 🔴 Security (Critical)

| Issue | Location | Fix |
|-------|----------|-----|
| No security headers (XSS, clickjacking, MIME sniffing) | `app.ts` | Added `helmet()` middleware |
| CORS wildcard `'*'` on Socket.IO | `server.ts` | Reads from `CORS_ORIGIN` env var |
| Weak OTP generation via `Math.random()` | `generateOTP.ts` | Replaced with `crypto.randomInt()` |
| No body size limit (request bombing) | `app.ts` | Added `express.json({ limit: '1mb' })` |
| Default port 1000 (requires root on Unix) | `config/index.ts` | Changed default to 5000 |

### 🟡 Performance (Medium)

| Issue | Location | Fix |
|-------|----------|-----|
| No response compression (gzip/brotli) | `app.ts` | Added `compression()` middleware |
| New SMTP transport created per email | `emailHelper.ts` | Cached transporter singleton |
| No Mongoose connection pool config | `server.ts` | Added `maxPoolSize: 10`, `serverSelectionTimeoutMS: 5000` |
| Missing `await` on `mongoose.connect()` | `server.ts` | Added proper `await` |
| Silent failure on startup errors | `server.ts` | Added error logging + `process.exit(1)` |

### 🟢 Cleanup (Low)

| Issue | Location | Fix |
|-------|----------|-----|
| `colors` package — never imported | `package.json` | Removed |
| `morgan` package — never imported | `package.json` | Removed |
| `winston` + `winston-daily-rotate-file` — never imported | `package.json` | Removed |
| `@types/morgan` — dead type dep | `package.json` | Removed |
| Both `package-lock.json` and `yarn.lock` in backend | backend root | Will delete `yarn.lock` |
| Debug middleware logging every request body/headers | `app.ts` | Removed (the `debug()` utility in `shared/debug.ts` still exists for targeted use) |
| Empty file `constrant.ts` (0 bytes) | `shared/constrant.ts` | Noted — not removed (may be used later) |

---

## Architecture Notes

### What's Good
- **Clean module pattern**: Each domain (user, auth, resetToken) has its own route/controller/service/model/validation files
- **Centralized error handling**: Global error handler with Zod/Mongoose/JWT error type detection
- **catchAsync wrapper**: Properly catches async errors and forwards to error middleware
- **QueryBuilder class**: Reusable Mongoose query builder with search, filter, sort, paginate, populate
- **Typed Express request**: Global `req.user` declaration via `index.d.ts`

### What Needs Attention
- **Socket.IO is dead code**: The socket helper does nothing (empty connect/disconnect handlers). `global.io` is set but never used by any module. Consider removing if not needed — it adds ~150KB to the bundle
- **Frontend is boilerplate**: `page.tsx` is the default create-next-app template. No actual church app UI has been built yet
- **Typos in filenames**: `emailTamplate.ts` → should be `emailTemplate.ts`, `constrant.ts` → should be `constant.ts`
- **Hardcoded JWT fallback secrets**: Config defaults to `'dev-secret'` if `JWT_SECRET` env var is missing. This is fine for dev but must be set in production

---

## Dependencies After Cleanup

### Removed (4 packages)
- `colors` — decorative console output, never used
- `morgan` — HTTP request logger, never imported
- `winston` — logging framework, never imported  
- `winston-daily-rotate-file` — log rotation, never imported

### Added (2 packages)
- `helmet` — sets security headers (X-Frame-Options, CSP, HSTS, etc.)
- `compression` — gzip/brotli response compression

### Net result: **-2 production dependencies**, improved security and performance

---

## DevOps Setup Added

| File | Purpose |
|------|---------|
| Root `package.json` | Monorepo scripts (`dev`, `build`, `start`, `install:all`, `lint`, `test`) |
| Root `.env` / `.env.example` | Centralized configuration |
| Root `.gitignore` | Prevents secrets and build artifacts from being committed |
| `docker-compose.yml` | One-command deploy with MongoDB, backend, and frontend |
| `frontend/Dockerfile` | Multi-stage Next.js standalone build |
| `frontend/.dockerignore` | Clean Docker context |
| Root `.dockerignore` | Clean Docker context |
| Root `README.md` | Quick Start guide with local dev and Docker instructions |

---

## Performance Expectations

With the optimizations applied:
- **Simple GET endpoints** (e.g., health check, profile): **< 50ms** response time
- **Auth endpoints** (login, register): **< 200ms** (bcrypt hashing is intentionally slow)
- **All responses**: gzip compressed via `compression()` middleware
- **MongoDB**: Connection pooling with 10 max connections
