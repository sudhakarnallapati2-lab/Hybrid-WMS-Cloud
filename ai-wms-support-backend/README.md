# AI WMS Support API (FastAPI)

Endpoints used by the Hybrid WMS Dashboard.

## Quick Start (no Docker)
```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## With Docker
```bash
docker compose up -d --build
```

## Auth
- `POST /auth/login` with `username`/`password` (form or JSON). Demo users:
  - operator1 / op@123 (role: operator)
  - support1 / sup@123 (roles: support, operator)

Include returned JWT as `Authorization: Bearer <token>`.
Also include header `x-api-key: <API_KEY_HEADER>` if you set it in `.env`.

## Routes
- `GET /` — health
- `GET /lpn/{lpn}` — operator/support
- `GET /pick/status/{delivery}` — support
- `GET /monitor/awr/top-waits?hours=1` — support
- `GET /monitor/awr/db-time?hours=1` — support
- `POST /ticket/summarize` — operator/support
