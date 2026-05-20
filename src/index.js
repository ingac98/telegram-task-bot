const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const connectDB = require('./db');
const taskRoutes = require('./routes/taskRoutes');
const { startBot } = require('./bot');

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
    database: 'connected',
  });
});

app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada',
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`Servidor ejecutándose en ${env.appUrl}`);
      console.log(`Puerto: ${env.port}`);
      console.log(`Entorno: ${env.nodeEnv}`);
      console.log(`Zona horaria: ${env.timezone}`);

      startBot().catch((error) => {
        console.error('Error al iniciar el bot de Telegram:', error.message);
        console.error(error);
      });
    });
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
};

startServer();