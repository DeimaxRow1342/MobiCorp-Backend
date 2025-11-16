import pool from '../config/db.js';
import bcrypt from 'bcrypt';

async function check() {
  try {
    const [rows] = await pool.execute('SELECT id, username, email, password FROM users LIMIT 10');
    console.log('Usuarios encontrados:', rows.length);
    for (const r of rows) {
      console.log('\n---');
      console.log('id:', r.id);
      console.log('username:', r.username);
      console.log('email:', r.email);
      console.log('hash:', r.password);
      const match = await bcrypt.compare('admin123', r.password);
      console.log('admin123 coincide?:', match);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error comprobando usuarios:', err.message || err);
    process.exit(1);
  }
}

check();
