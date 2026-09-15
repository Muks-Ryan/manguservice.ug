# Mangu Service UG

> Technician appointment and recommendation platform connecting clients with verified local skilled technicians across Uganda.

---

## 📌 Project Quick Links

- **Full Documentation**: See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete architecture, user roles, API specifications, and module guide.
- **Live Demo Port**: `3000` (Vite + Express)

---

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Environment setup

Create a `.env` file in the project root before starting the app:

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mangu_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=replace_with_a_long_random_string
DATABASE_URL=
COOKIE_DOMAIN=
```

### Public deployment checklist (first six required steps)

1. Set `NODE_ENV=production` and a real `FRONTEND_URL` that matches the public domain.
2. Set a strong `JWT_SECRET` with at least 32 random characters.
3. Use a managed PostgreSQL database and set either `DATABASE_URL` or the DB host/user/password variables.
4. Restrict `FRONTEND_URL` to the actual frontend origin and keep CORS credentials enabled only for that domain.
5. Enable secure cookies in production with `secure: true` and `sameSite: 'none'` only when the app is served over HTTPS.
6. Remove any demo credentials or default seed users before going live; the production database should start empty except for your real admin account.

```env
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=replace_with_a_very_long_random_secret_at_least_32_chars
DATABASE_URL=postgresql://user:password@host:5432/database
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=
COOKIE_DOMAIN=
```

### Development Server

```bash
npm run server
npm run dev
```

### Type Verification

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

---

## 🛠️ Recommended deployment stack

- **Frontend**: Vite + React on a static hosting service such as Vercel, Netlify, or Cloudflare Pages
- **Backend**: Node.js + Express on Render, Railway, Fly.io, DigitalOcean App Platform, or Azure App Service
- **Database**: Managed PostgreSQL such as Supabase, Neon, Railway Postgres, or Azure Database for PostgreSQL
- **HTTPS + Domain**: Cloudflare or the hosting platform-managed TLS certificate

This keeps the API and database private while the frontend stays lightweight and fast to deploy.

### Railway deployment config

This app is a good fit for Railway because the backend already runs as an Express API and the project includes a PostgreSQL database layer.

1. Create a new Railway project.
2. Add a PostgreSQL service from the Railway catalog. Railway exposes the database via `DATABASE_URL` automatically.
3. Deploy the app service from this repository and set the environment variables:

```env
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=replace_with_a_very_long_random_secret_at_least_32_chars
DATABASE_URL=${{Postgres.DATABASE_URL}}
COOKIE_DOMAIN=
```

4. Set the deploy command to:

```bash
npm install && npm run build && npm run server
```

5. Keep the frontend on Vercel or another static host and point it at the Railway API URL as `VITE_API_URL` if you later move the client to a separate deployment.

### Railway file

A production deploy config is included at `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run server",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Final deployment checklist

1. Replace all demo credentials and default passwords.
2. Set strong env values for `JWT_SECRET`, `DATABASE_URL`, and `FRONTEND_URL`.
3. Keep the backend behind HTTPS and use `secure: true` cookies in production.
4. Restrict CORS to your real frontend domain.
5. Use a non-root database user with least-privilege access.
6. Run a final smoke test for registration, login, logout, and technician CRUD.
7. Set up monitoring, log retention, and error alerts.

### Typical deployment flow

```bash
npm install
npm run build
npm run server
```

Then deploy the built frontend and the Express backend separately, connect them using the production `FRONTEND_URL` and database variables, and confirm the app responds over HTTPS.

---

## 📄 License

Mangu Service UG © 2026. All rights reserved.
