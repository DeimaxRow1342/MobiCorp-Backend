import pool from '../config/db.js';
import bcrypt from 'bcrypt';

async function setPassword() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const [res] = await pool.execute('UPDATE users SET password = ? WHERE username = ?', [hash, 'admin']);
    console.log('Rows affected:', res.affectedRows);

    // verify
    const [rows] = await pool.execute('SELECT id, username, password FROM users WHERE username = ?', ['admin']);
    const match = await bcrypt.compare('admin123', rows[0].password);
    console.log('Verificación después de update:', match);
    process.exit(0);
  } catch (err) {
    console.error('Error seteando password:', err.message || err);
    process.exit(1);
  }
}

setPassword();
