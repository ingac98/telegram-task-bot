const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  botToken: process.env.BOT_TOKEN || '',
  mongodbUri: process.env.MONGODB_URI || '',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  timezone: process.env.TIMEZONE || 'America/Lima',
};

module.exports = env;