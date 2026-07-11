# Raithana Swarajya

Raithana Swarajya is a bilingual marketplace app for producers and consumers to connect, list harvests, and discuss orders directly.

## What is included
- Producer dashboard for publishing and managing inventory
- Consumer marketplace for browsing crops and opening conversations
- Messaging drawer for direct negotiation and follow-up
- Supabase-backed auth and profile sync
- FastAPI backend with marketplace endpoints

## Tech stack
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI + Pydantic + httpx
- Data/auth: Supabase

## Local setup
1. Copy the example environment files and fill in your Supabase values:
   - backend/.env.example -> backend/.env
   - frontend/.env.example -> frontend/.env
2. Install dependencies:
   - Frontend: cd frontend && npm install
   - Backend: cd backend && python -m pip install -r requirements.txt
3. Start the app:
   - Backend: cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   - Frontend: cd frontend && npm run dev
   - Or on Windows PowerShell: ./start-dev.ps1

## Verification
- Frontend build: cd frontend && npm run build
- Backend tests: cd backend && python -m pytest -q

## Notes
- The UI includes graceful fallbacks for missing Supabase environment variables so the app still loads locally, but auth and marketplace features need a real Supabase project to function end to end.
