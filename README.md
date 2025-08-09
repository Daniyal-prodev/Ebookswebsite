# Ebookswebsite

Full‑stack Kids Ebooks store:
- Frontend: React + Vite (http://localhost:5173)
- Backend: FastAPI (http://127.0.0.1:8000)

## Quick start (local)

1) Install deps
- Node 18+ and Python 3.12 are recommended
- From repo root:
  - npm run install:all

2) Environment
- Frontend
  - cp frontend/.env.example frontend/.env.local
  - Adjust VITE_API_URL if needed (defaults to http://127.0.0.1:8000)
- Backend
  - cp backend/.env.example backend/.env
  - Set SMTP_* and CONTACT_RECIPIENT for real email delivery
  - FRONTEND_ORIGIN should be http://localhost:5173 for local dev

3) Run both servers
- npm run dev
- Frontend at http://localhost:5173
- Backend API at http://127.0.0.1:8000

## Contact email

POST /contact accepts:
- name: string
- email: string (valid email)
- message: string

Email delivery uses these env vars:
- CONTACT_RECIPIENT
- SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_USE_TLS
If SMTP_* is not configured, backend logs the email content (dev fallback).

## Admin

Default admin credentials (override via env):
- ADMIN_EMAIL=aribdaniyal88@gmail.com
- ADMIN_PASSWORD=daniyaldanish88

Admin routes:
- /secret-admin/login
- /secret-admin (dashboard)
- /secret-admin/products/new (create product)
- /secret-admin/products/:id (edit product)

## Scripts

- npm run dev         # runs frontend + backend concurrently
- npm run dev:frontend
- npm run dev:backend

## Notes

- Do not commit real secrets. Use .env files locally or platform environment variables in production.
- Images are referenced by URLs; ensure CORS allows fetching images in browsers.
