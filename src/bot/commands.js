const taskService = require('../services/taskService');
const { showMainMenu } = require('./menu');
const {
  getPendingTasks,
  getTodayTasks,
  getOverdueTasks,
  showTaskList,
  formatDate,
  getTelegramUserId
} = require('./actions');

const helpMessage = [
  '❓ Ayuda de TaskBot',
  '',
  'Comandos disponibles:',
  '',
  '/start - Iniciar el bot',
  '/help - Mostrar ayuda',
  '/menu - Mostrar menú principal',
  '/agregar título de la tarea - Crear una tarea',
  '/listar - Listar tareas pendientes',
  '/hoy - Ver tareas de hoy',
  '/vencidas - Ver tareas vencidas',
  '/ver ID - Ver detalle de una tarea',
  '/hecho ID - Marcar tarea como completada',
  '/eliminar ID - Eliminar tarea',
  '',
  'Ejemplos:',
  '/agregar estudiar MongoDB',
  '/listar',
  '/ver 664a1234567890abcdef1234',
  '/hecho 664a1234567890abcdef1234'
].join('\n');

const createTask = async ({ telegramUserId, title }) => {
  if (typeof taskService.createTask === 'function') {
    return taskService.createTask({
      telegramUserId,
      title
    });
  }

  throw new Error('No se encontró createTask en taskService.js');
};

const getTaskById = async (id, telegramUserId) => {
  if (typeof taskService.getTaskById === 'function') {
    return taskService.getTaskById(id, telegramUserId);
  }

  if (typeof taskService.findTaskById === 'function') {
    return taskService.findTaskById(id, telegramUserId);
  }

  throw new Error('No se encontró función para obtener tarea por ID en taskService.js');
};

const completeTask = async (id, telegramUserId) => {
  if (typeof taskService.completeTask === 'function') {
    return taskService.completeTask(id, telegramUserId);
  }

  if (typeof taskService.markTaskAsCompleted === 'function') {
    return taskService.markTaskAsCompleted(id, telegramUserId);
  }

  throw new Error('No se encontró función para completar tarea en taskService.js');
};

const deleteTask = async (id, telegramUserId) => {
  if (typeof taskService.deleteTask === 'function') {
    return taskService.deleteTask(id, telegramUserId);
  }

  if (typeof taskService.removeTask === 'function') {
    return taskService.removeTask(id, telegramUserId);
  }

  throw new Error('No se encontró función para eliminar tarea en taskService.js');
};

const registerCommands = (bot) => {
  bot.start(async (ctx) => {
    const firstName = ctx.from.first_name || 'usuario';

    await ctx.reply(
      [
        `👋 Hola, ${firstName}. Soy TaskBot.`,
        '',
        'Te ayudaré a gestionar tus tareas desde Telegram.',
        '',
        'Usa /menu para ver las opciones principales.',
        'Usa /help para ver los comandos disponibles.'
      ].join('\n')
    );
  });

  bot.help(async (ctx) => {
    await ctx.reply(helpMessage);
  });

  bot.command('menu', async (ctx) => {
    await showMainMenu(ctx);
  });

  bot.command('agregar', async (ctx) => {
    try {
      const telegramUserId = getTelegramUserId(ctx);
      const text = ctx.message.text.replace('/agregar', '').trim();

      if (!text) {
        await ctx.reply(
          [
            '⚠️ Debes escribir el título de la tarea.',
            '',
            'Ejemplo:',
            '/agregar estudiar redes'
          ].join('\n')
        );
        return;
      }

      const task = await createTask({
        telegramUserId,
        title: text
      });

      await ctx.reply(
        [
          '✅ Tarea registrada correctamente.',
          '',
          `Título: ${task.title}`,
          `ID: ${task._id}`
        ].join('\n')
      );
    } catch (error) {
      console.error('Error al crear tarea desde Telegram:', error);
      await ctx.reply('❌ Ocurrió un error al crear la tarea.');
    }
  });

  bot.command(['listar', 'pendientes'], async (ctx) => {
    try {
      const telegramUserId = getTelegramUserId(ctx);
      const tasks = await getPendingTasks(telegramUserId);

      await showTaskList(
        ctx,
        tasks,
        '✅ No tienes tareas pendientes.'
      );
    } catch (error) {
      console.error('Error al listar tareas desde Telegram:', error);
      await ctx.reply('❌ Ocurrió un error al listar tus tareas.');
    }
  });

  bot.command('hoy', async (ctx) => {
    try {
      const telegramUserId = getTelegramUserId(ctx);
      const tasks = await getTodayTasks(telegramUserId);

      await showTaskList(
        ctx,
        tasks,
        '📅 No tienes tareas programadas para hoy.'
      );
    } catch (error) {
      console.error('Error al listar tareas de hoy desde Telegram:', error);
      await ctx.reply('❌ Ocurrió un error al listar tus tareas de hoy.');
    }
  });

  bot.command('vencidas', async (ctx) => {
    try {
      const telegramUserId = getTelegramUserId(ctx);
      const tasks = await getOverdueTasks(telegramUserId);

      await showTaskList(
        ctx,
        tasks,
        '✅ No tienes tareas vencidas.'
      );
    } catch (error) {
      console.error('Error al listar tareas vencidas desde Telegram:', error);
      await ctx.reply('❌ Ocurrió un error al listar tus tareas vencidas.');
    }
  });

  bot.command('ver', async (ctx) => {
    try {
      const telegramUserId = getTelegramUserId(ctx);
      const id = ctx.message.text.replace('/ver', '').trim();

      if (!id) {
        await ctx.reply(
          [
            '⚠️ Debes enviar el ID de la tarea.',
            '',
            'Ejemplo:',
            '/ver 664a1234567890abcdef1234'
          ].join('\n')
        );
        return;
      }

      const task = await getTaskById(id, telegramUserId);

      if (!task) {
        await ctx.reply('⚠️ No encontré una tarea con ese ID.');
        return;
      }

      await ctx.reply(
        [
          '🔎 Detalle de tarea',
          '',
          `ID: ${task._id}`,
          `Título: ${task.title}`,
          `Descripción: ${task.description || 'Sin descripción'}`,
          `Estado: ${task.status}`,
          `Fecha: ${formatDate(task.dueDate)}`,
          `Recordatorio enviado: ${task.reminderSent ? 'Sí' : 'No'}`,
          `Completada en: ${formatDate(task.completedAt)}`
        ].join('\n')
      );
    } catch (error) {
      console.error('Error al ver detalle de tarea desde Telegram:', error);
      await ctx.reply('❌ Ocurrió un error al consultar la tarea.');
    }
  });

  bot.command('hecho', async (ctx) => {
    try {
      const telegramUserId = getTelegramUserId(ctx);
      const id = ctx.message.text.replace('/hecho', '').trim();

      if (!id) {
        await ctx.reply(
          [
            '⚠️ Debes enviar el ID de la tarea.',
            '',
            'Ejemplo:',
            '/hecho 664a1234567890abcdef1234'
          ].join('\n')
        );
        return;
      }

      const task = await completeTask(id, telegramUserId);

      if (!task) {
        await ctx.reply('⚠️ No encontré una tarea pendiente con ese ID.');
        return;
      }

      await ctx.reply(
        [
          '✅ Tarea completada correctamente.',
          '',
          `Título: ${task.title}`,
          `Estado: ${task.status}`,
          `Completada en: ${formatDate(task.completedAt)}`
        ].join('\n')
      );
    } catch (error) {
      console.error('Error al completar tarea desde Telegram:', error);
      await ctx.reply('❌ Ocurrió un error al completar la tarea.');
    }
  });

  bot.command('eliminar', async (ctx) => {
    try {
      const telegramUserId = getTelegramUserId(ctx);
      const id = ctx.message.text.replace('/eliminar', '').trim();

      if (!id) {
        await ctx.reply(
          [
            '⚠️ Debes enviar el ID de la tarea.',
            '',
            'Ejemplo:',
            '/eliminar 664a1234567890abcdef1234'
          ].join('\n')
        );
        return;
      }

      const task = await deleteTask(id, telegramUserId);

      if (!task) {
        await ctx.reply('⚠️ No encontré una tarea con ese ID.');
        return;
      }

      await ctx.reply(
        [
          '🗑️ Tarea eliminada correctamente.',
          '',
          `Título: ${task.title}`,
          `Estado: ${task.status}`
        ].join('\n')
      );
    } catch (error) {
      console.error('Error al eliminar tarea desde Telegram:', error);
      await ctx.reply('❌ Ocurrió un error al eliminar la tarea.');
    }
  });

  bot.on('text', async (ctx) => {
    await ctx.reply(
      [
        'No reconozco ese comando.',
        '',
        'Usa /menu para ver las opciones disponibles.',
        'Usa /help para ver la ayuda.'
      ].join('\n')
    );
  });
};

module.exports = {
  registerCommands
};