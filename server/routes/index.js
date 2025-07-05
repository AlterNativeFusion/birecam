import express from 'express';
import userRoutes from "./userRoutes.js";
import stockRoutes from "./stockRoutes.js";
import loanRoutes from "./loanRoutes.js";
import loginRoutes from "./loginRoutes.js";
import configRoutes from "./configRoutes.js";
import dotenv from "dotenv";
import path from 'path';
import cors from 'cors';

// Cargar variables de entorno
dotenv.config({ path: path.resolve('./config/.env') });

// Fallback si no se encuentra .env externo
dotenv.config();

const app = express();

// Render proporciona su propio puerto a través de process.env.PORT
const PORT = process.env.PORT || 3000;
const PORT_FRONT = process.env.PORT_FRONT || '*'; 

// Habilitar CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://birecamsanjuan.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());

// Rutas
app.use('/users', userRoutes);
app.use('/stock', stockRoutes);
app.use('/loan', loanRoutes);
app.use('/login', loginRoutes);
app.use('/config', configRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
