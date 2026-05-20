const { Telegraf } = require('telegraf');

const env = require('./config/env');
const { registerCommands } = require('./bot/commands');
const { registerActions } = require('./bot/actions');

if (!env.botToken) {
  throw new Error('BOT_TOKEN no está definido en el archivo .env');
}

const bot = new Telegraf(env.botToken);

registerCommands(bot);
registerActions(bot);

const startBot = async () => {
  if (env.nodeEnv === 'production') {
    console.log('Bot configurado para producción. Webhook se implementará en una etapa posterior.');
    return;
  }

  console.log('Iniciando bot de Telegram en modo polling local...');

  const botInfo = await bot.telegram.getMe();

  console.log(`Bot detectado: @${botInfo.username}`);
  console.log('Bot de Telegram iniciado en modo polling local.');

  await bot.launch();
};

process.once('SIGINT', () => {
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
});

module.exports = {
  bot,
  startBot,
};