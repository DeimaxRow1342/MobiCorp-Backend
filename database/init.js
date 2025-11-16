import pool from '../config/db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  try {
    const schemaSQL = fs.readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    // Ejecutar con multipleStatements habilitado en el pool
    await pool.query(schemaSQL);
    console.log('✅ Base de datos inicializada correctamente');
    console.log('👤 Usuario por defecto: admin / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

initDatabase();
