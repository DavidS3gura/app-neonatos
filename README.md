# Hamacaterapia - Sistema de Investigación Clínica

Sistema de recolección de datos clínicos para estudio de hamacaterapia en neonatos prematuros.

## Arquitectura

```
hamacaterapia-app/
├── backend/                    # Express + Prisma + PostgreSQL
│   ├── src/
│   │   ├── config/env.ts       # Variables de entorno
│   │   ├── controllers/        # Lógica de negocio
│   │   │   ├── auth.controller.ts
│   │   │   ├── neonato.controller.ts
│   │   │   ├── observacion.controller.ts
│   │   │   ├── usuario.controller.ts
│   │   │   └── export.controller.ts
│   │   ├── middleware/auth.ts  # JWT + roles
│   │   ├── routes/             # Definición de rutas
│   │   └── server.ts           # Entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Modelo de datos
│   │   └── seed.ts             # Usuario admin inicial
│   ├── .env                    # Variables de entorno
│   ├── package.json
│   └── tsconfig.json
├── src/                        # Frontend React + Vite
│   ├── components/
│   ├── contexts/AuthContext.tsx
│   ├── pages/
│   ├── services/api.ts         # Cliente HTTP al backend
│   └── main.tsx
├── docker-compose.yml          # PostgreSQL
└── package.json
```

## Requisitos

- Node.js 18+
- Docker y Docker Compose

## Instalación y ejecución

### 1. Base de datos PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env  # Editar si es necesario (ya viene configurado para dev)
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

El backend correrá en `http://localhost:3001`

### 3. Frontend

```bash
# Desde la raíz del proyecto
npm install
npm run dev
```

El frontend correrá en `http://localhost:5173`

## Variables de entorno

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hamacaterapia
JWT_SECRET=hamacaterapia_jwt_secret_dev_2024
PORT=3001
```

### Frontend

El frontend usa `VITE_API_URL` (por defecto `http://localhost:3001`).

## Credenciales iniciales

- **Email:** admin@hamacaterapia.local
- **Contraseña:** Admin12345
- **Rol:** admin

## API Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /auth/login | Login | No |
| POST | /auth/register | Registro | No |
| GET | /auth/me | Usuario actual | Sí |
| GET | /neonatos | Listar neonatos | Sí |
| POST | /neonatos | Crear neonato | Sí |
| PUT | /neonatos/:id | Actualizar neonato | Sí |
| GET | /neonatos/:id | Obtener neonato | Sí |
| GET | /neonatos/code/:code | Buscar por código | Sí |
| GET | /observaciones | Listar observaciones | Sí |
| POST | /observaciones | Crear observación | Sí |
| GET | /observaciones/neonato/:id | Por neonato | Sí |
| GET | /usuarios | Listar usuarios | Admin |
| POST | /usuarios | Crear usuario | Admin |
| PATCH | /usuarios/:id/activar | Toggle activo | Admin |
| GET | /export/neonatos | Excel neonatos | Sí |
| GET | /export/observaciones | Excel observaciones | Sí |
| GET | /export/neonatos/csv | CSV neonatos | Sí |
| GET | /export/observaciones/csv | CSV observaciones | Sí |

## Flujos principales

### Autenticación
1. Login con email/contraseña → backend valida con bcrypt → devuelve JWT
2. Token se almacena en localStorage y se envía en header `Authorization: Bearer <token>`
3. Middleware verifica JWT en cada request protegido

### Registro de neonatos
1. Formulario con validación frontend
2. POST /neonatos con datos → validación Zod en backend → INSERT en PostgreSQL
3. Código RN único garantizado por constraint UNIQUE

### Observaciones
1. Seleccionar neonato → completar escalas clínicas (1-5) con botones táctiles
2. POST /observaciones → validación → INSERT con relación a neonato

### Exportación
1. GET /export/neonatos o /observaciones → Prisma query → XLSX/CSV generado en backend
2. Archivo descargado directamente como blob
