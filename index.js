import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import pricingRoutes from './routes/pricing.js';
import productRoutes from './routes/products.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/products', productRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 MobiCorp Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      data: {
        save: 'POST /api/data',
        extract: 'POST /api/data/extract',
        getAll: 'GET /api/data',
        getById: 'GET /api/data/:id',
        delete: 'DELETE /api/data/:id'
      },
      pricing: {
        preview: 'POST /api/pricing/preview',
        confirm: 'POST /api/pricing/confirm'
      },
      products: {
        upsert: 'POST /api/products',
        list: 'GET /api/products',
        detail: 'GET /api/products/:id',
        setFinal: 'PUT /api/products/:id/final-price'
      }
    }
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación: http://localhost:${PORT}/\n`);
});

export default app;
