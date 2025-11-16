# MobiCorp Backend

Backend para el sistema de extracción de precios con IA de MobiCorp.

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Copia `.env.example` a `.env` y ajusta los valores:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=mobicorp_db
JWT_SECRET=tu_secreto_seguro
PORT=3000
```

3. Crear la base de datos MySQL (MySQL Workbench o CLI):
```sql
CREATE DATABASE IF NOT EXISTS mobicorp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Inicializar las tablas:
```bash
node database/init.js
```

## 📦 Estructura del Proyecto

```
MobiCorp-Backend/
├── config/
│   └── db.js                 # Configuración de MySQL (mysql2)
├── controllers/
│   ├── authController.js     # Lógica de autenticación
│   └── dataController.js     # Lógica de datos extraídos
├── database/
│   ├── schema.sql           # Esquema de base de datos
│   └── init.js              # Script de inicialización
├── middleware/
│   └── auth.js              # Middleware de autenticación JWT
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   └── data.js              # Rutas de datos
├── .env                     # Variables de entorno
├── .gitignore
├── index.js                 # Servidor principal
└── package.json
```

## 🔑 Endpoints

### Autenticación

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@mobicorp.com",
  "password": "admin123",
  "role": "admin"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Respuesta:
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mobicorp.com",
    "role": "admin"
  }
}
```

#### Perfil
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

### Datos Extraídos

#### Guardar datos extraídos por la IA
```http
POST /api/data
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://monaco-srl.com/categoria-producto/sillas-secretariales/",
  "category": "sillas",
  "data": {
    "productos": [
        extract: 'POST /api/data/extract',
      {
        "nombre": "Silla Ergonómica X1",
        "precio": "450 Bs",
        "caracteristicas": ["Respaldo alto", "Base metálica"]
      }
    ]
  },
  "notes": "Extracción automática"
}
```

#### Extraer y guardar (servidor hace la extracción)
```http
POST /api/data/extract
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://monaco-srl.com/categoria-producto/sillas-secretariales/",
  "category": "sillas",
  "notes": "Extracción desde dashboard"
}
```

#### Obtener todos los datos
```http
GET /api/data?category=sillas&limit=20&offset=0
Authorization: Bearer {token}
```

#### Obtener por ID
```http
GET /api/data/1
Authorization: Bearer {token}
```

#### Eliminar datos
```http
DELETE /api/data/1
Authorization: Bearer {token}
```

## 🗄️ Base de Datos

### Tabla: users
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR UNIQUE)
- `email` (VARCHAR UNIQUE)
- `password` (VARCHAR) - Hash bcrypt
- `role` (VARCHAR) - Default: 'admin'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabla: extracted_data
- `id` (SERIAL PRIMARY KEY)
- `url` (VARCHAR) - URL de origen
- `data` (JSONB) - JSON con productos y precios
- `extracted_at` (TIMESTAMP)
- `user_id` (INTEGER) - FK a users
- `category` (VARCHAR) - ej: 'sillas'
- `total_products` (INTEGER)
- `notes` (TEXT)

## 🔐 Credenciales por Defecto

- **Usuario:** admin
- **Password:** admin123

## 🏃‍♂️ Ejecutar

### Modo desarrollo
```bash
npm run dev
```

### Modo producción
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 🛠️ Tecnologías

- Express.js
- MySQL (mysql2)
- JWT (JSON Web Tokens)
- Bcrypt
- CORS
- dotenv

## 📝 Notas

- Todos los endpoints de `/api/data` requieren autenticación JWT
- Los tokens JWT expiran en 24 horas
- Los datos extraídos se guardan en columna JSON (MySQL 5.7+/8.0+)
