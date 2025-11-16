# 🚀 Guía Rápida de Configuración

## 1. Instalar MySQL

Si no tienes MySQL instalado:
- Windows: Descarga e instala MySQL Server y MySQL Workbench: https://dev.mysql.com/downloads/installer/
- Durante la instalación, anota la contraseña del usuario `root`

## 2. Crear la Base de Datos

Con MySQL Workbench o la consola de MySQL:

```sql
CREATE DATABASE IF NOT EXISTS mobicorp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 3. Configurar Variables de Entorno

Edita el archivo `.env` con tus credenciales de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_DE_MYSQL_AQUI
DB_NAME=mobicorp_db
JWT_SECRET=mobicorp_secret_key_2025
PORT=3000
```

## 4. Inicializar las Tablas

```bash
node database/init.js
```

Deberías ver:
```
✅ Conectado a MySQL
✅ Base de datos inicializada correctamente
👤 Usuario por defecto: admin / admin123
```

## 5. Iniciar el Servidor

```bash
npm start
```

O en modo desarrollo:
```bash
npm run dev
```

## 6. Probar la API

Abre http://localhost:3000 y deberías ver la documentación de la API.

### Hacer Login:

```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Guarda el `token` que te devuelve para las siguientes peticiones.

### Guardar datos extraídos:

```bash
curl -X POST http://localhost:3000/api/data ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TU_TOKEN_AQUI" ^
  -d "{\"url\":\"https://ejemplo.com\",\"category\":\"sillas\",\"data\":{\"productos\":[{\"nombre\":\"Silla X\",\"precio\":\"450 Bs\"}]}}"
```

## ✅ ¡Listo!

Tu backend está configurado y funcionando. Ahora puedes:
1. Usar el frontend para hacer login
2. Extraer datos con el chat.js
3. Guardar esos datos en la base de datos usando la API
