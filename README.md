# Student Grievance Management System

A full-stack MERN application that allows students to register, login, submit grievances, and manage them.

## Tech Stack

- **Frontend**: React 18 + Vite + React Router v6 + Axios
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT + bcryptjs

---

## Project Structure

```
student-grievance-system/
├── backend/
│   ├── models/
│   │   ├── Student.js        # User schema with hashed password
│   │   └── Grievance.js      # Grievance schema
│   ├── routes/
│   │   ├── auth.js           # POST /api/register, POST /api/login, GET /api/me
│   │   └── grievances.js     # Full CRUD + search
│   ├── middleware/
│   │   └── auth.js           # JWT protect middleware
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/index.js          # Axios instance + API calls
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── Register.jsx
    │   │   ├── Login.jsx
    │   │   └── Dashboard.jsx     # Full CRUD UI
    │   ├── App.jsx               # Routing (protected + public routes)
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/register` | Register new student | ✗ |
| POST | `/api/login` | Login & receive JWT | ✗ |
| GET | `/api/me` | Get current user | ✓ |
| POST | `/api/grievances` | Submit grievance | ✓ |
| GET | `/api/grievances` | Get all grievances (paginated) | ✓ |
| GET | `/api/grievances/search?title=xyz` | Search grievances | ✓ |
| GET | `/api/grievances/:id` | Get grievance by ID | ✓ |
| PUT | `/api/grievances/:id` | Update grievance | ✓ |
| DELETE | `/api/grievances/:id` | Delete grievance | ✓ |

---

## Setup Instructions

### Option 1: Docker (Recommended - 1 Command)

Run the entire full-stack application (React Frontend, Express Backend, and MongoDB) with zero manual dependency setup:

```bash
# Production stack
docker compose up --build -d

# Development stack (live hot-reloading for frontend & backend)
docker compose -f docker-compose.dev.yml up --build
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- Detailed configuration, environment customization, and Atlas support: see [DOCKER.md](DOCKER.md).

---

### Option 2: Local Manual Setup

#### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm run dev   # Development with nodemon
# OR
npm start     # Production
```

### Frontend

```bash
cd frontend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit VITE_API_URL if your backend runs on a different port

npm run dev   # Start dev server on http://localhost:5173
```

---

## Deployment

### Backend → Render
1. Push code to GitHub
2. Create a new **Web Service** on Render
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`

### Frontend → Render (Static Site)
1. Create a new **Static Site** on Render
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Publish Directory**: `dist`
5. Add environment variable: `VITE_API_URL` (your backend Render URL)

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/grievance_db
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000
```
