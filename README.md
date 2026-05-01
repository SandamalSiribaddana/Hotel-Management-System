# Hotel Management System — Base Template

This repo has been refactored into a **clean starter template** that keeps only **shared/common functionality**.

## What remains

- **Backend**: Express + MongoDB + JWT auth (register/login/profile) + admin auto-seed
- **Frontend**: Minimal React app with Login/Register/Profile + shared API client

## Run (dev)

### Backend

```bash
cd backend
npm ci
npm run dev
```

Required env (create `backend/.env`):

```env
MONGO_URI=...
JWT_SECRET=...
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
PORT=5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional env (create `frontend/.env` if needed):

```env
VITE_API_BASE_URL=http://localhost:5000
```

# Hotel-Management-System-official