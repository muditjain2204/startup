# SmartRoad AI — Enterprise Road Damage Detection & Repair Platform

SmartRoad AI is an AI-powered road surface distress detection, GIS monitoring, and transparent public infrastructure repair contract management platform tailored for the Indian infrastructure ecosystem (PWD, NHAI, and Smart Cities Mission).

---

## 🌟 Architecture Overview

1. **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons, Leaflet OpenStreetMap GIS, Canvas Confetti.
2. **Backend**: Node.js Express, TypeScript, Prisma ORM, PostgreSQL with PostGIS 3.4 spatial indices, JWT authentication, Role-Based Access Control (RBAC).
3. **AI Vision Service**: Python FastAPI, Pillow & NumPy morphological surface defect analysis, YOLOv8 computer vision detection interface.
4. **Database**: PostgreSQL 16 + PostGIS 3.4 running in Docker on port `5434`.

---

## 🚀 Live Services & Ports

| Service | Port | Description |
| :--- | :--- | :--- |
| **Frontend Portal** | `http://localhost:3000` | Web application for Landing, Admin, Contractor, & Citizen |
| **Backend REST API** | `http://localhost:5000` | REST API, Multer upload engine, JWT & PostGIS matcher |
| **AI Computer Vision** | `http://localhost:8000` | FastAPI defect classifier, severity & depth estimator |
| **PostGIS Database** | `localhost:5434` | PostgreSQL 16 with PostGIS 3.4 spatial extensions |

---

## 🔑 Default Seed Credentials & 1-Click Switchers

SmartRoad AI includes a 1-click role switcher in the navigation bar and on the login page:

| Role | Name & Organization | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Er. Rajesh Varma (Chief PWD Engineer) | `admin@smartroad.gov.in` | `Admin@123` |
| **Contractor 1** | M/s Rajput Road Infrastructures Ltd (30km radius) | `info@rajputroadworks.com` | `Contractor@123` |
| **Contractor 2** | Delhi Modern Paving & Civil Works Ltd (25km radius) | `contact@delhipaving.in` | `Contractor@123` |
| **Citizen** | Aarav Sharma (South Delhi) | `aarav.sharma@gmail.com` | `Citizen@123` |

---

## 🛣️ Core 8-Stage Lifecycle Journey

```
[1. Report Damage] ➔ [2. AI Vision Scan] ➔ [3. PWD Verification] ➔ [4. PostGIS Tender]
        ➔ [5. Contractor Bidding] ➔ [6. Contract Award] ➔ [7. Repair Execution] ➔ [8. PWD Inspection Sign-Off]
```

---

## 🛠️ Development & Startup

### 1. Database (Docker PostGIS)
```bash
docker run -d --name smartroad-db -e POSTGRES_USER=smartroad -e POSTGRES_PASSWORD=smartroad_pass -e POSTGRES_DB=smartroad_ai -p 5434:5432 postgis/postgis:16-3.4
```

### 2. Backend
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm start
```

### 3. AI Vision Engine
```bash
cd ai-service
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 4. Frontend Web App
```bash
cd frontend
npm install
npm run build
npm start
```

