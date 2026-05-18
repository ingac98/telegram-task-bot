const mongoose = require('mongoose');

const env = require('./config/env');

const connectDB = async () => {
  try {
    if (!env.mongodbUri) {
      throw new Error('MONGODB_URI no está definida en el archivo .env');
    }

    await mongoose.connect(env.mongodbUri);

    console.log('MongoDB Atlas conectado correctamente');
  } catch (error) {
    console.error('Error al conectar con MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;