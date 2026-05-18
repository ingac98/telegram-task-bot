const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'TaskBot backend activo',
    environment: env.nodeEnv,
    timezone: env.timezone,
  });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada',
  });
});

app.listen(env.port, () => {
  console.log(`Servidor ejecutándose en ${env.appUrl}`);
  console.log(`Puerto: ${env.port}`);
  console.log(`Entorno: ${env.nodeEnv}`);
  console.log(`Zona horaria: ${env.timezone}`);
});