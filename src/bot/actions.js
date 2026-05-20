const taskService = require('../services/taskService');

const formatDate = (date) => {
  if (!date) return 'Sin fecha';

  return new Date(date).toLocaleString('es-PE', {
    timeZone: process.env.TIMEZONE || 'America/Lima',
    dateStyle: 'short',
    timeStyle: 'short'
  });
};

const formatTask = (task, index) => {
  return [
    `${index + 1}. ${task.title}`,
    `   ID: ${task._id}`,
    `   Estado: ${task.status}`,
    `   Fecha: ${formatDate(task.dueDate)}`
  ].join('\n');
};

const getTelegramUserId = (ctx) => {
  return String(ctx.from.id);
};

const getPendingTasks = async (telegramUserId) => {
  if (typeof taskService.getTasks === 'function') {
    return taskService.getTasks({ telegramUserId, status: 'pendiente' });
  }

  if (typeof taskService.getAllTasks === 'function') {
    return taskService.getAllTasks({ telegramUserId, status: 'pendiente' });
  }

  throw new Error('No se encontró una función para listar tareas en taskService.js');
};

const getOverdueTasks = async (telegramUserId) => {
  if (typeof taskService.getOverdueTasks === 'function') {
    return taskService.getOverdueTasks(telegramUserId);
  }

  const tasks = await getPendingTasks(telegramUserId);
  const now = new Date();

  return tasks.filter((task) => {
    return task.dueDate && new Date(task.dueDate) < now;
  });
};

const getTodayTasks = async (telegramUserId) => {
  const tasks = await getPendingTasks(telegramUserId);

  const now = new Date();
  const todayInPeru = new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.TIMEZONE || 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  return tasks.filter((task) => {
    if (!task.dueDate) return false;

    const taskDateInPeru = new Intl.DateTimeFormat('en-CA', {
      timeZone: process.env.TIMEZONE || 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(task.dueDate));

    return taskDateInPeru === todayInPeru;
  });
};

const showTaskList = async (ctx, tasks, emptyMessage) => {
  if (!tasks || tasks.length === 0) {
    await ctx.reply(emptyMessage);
    return;
  }

  const message = tasks.map(formatTask).join('\n\n');

  await ctx.reply(message);
};

const registerActions = (bot) => {
  bot.action('TASK_ADD', async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.reply(
      [
        '➕ Para agregar una tarea usa:',
        '',
        '/agregar título de la tarea',
        '',
        'Ejemplo:',
        '/agregar estudiar redes'
      ].join('\n')
    );
  });

  bot.action('TASK_LIST_PENDING', async (ctx) => {
    await ctx.answerCbQuery();

    try {
      const telegramUserId = getTelegramUserId(ctx);
      const tasks = await getPendingTasks(telegramUserId);

      await showTaskList(
        ctx,
        tasks,
        '✅ No tienes tareas pendientes.'
      );
    } catch (error) {
      console.error('Error al listar tareas pendientes:', error);
      await ctx.reply('❌ Ocurrió un error al listar tus tareas pendientes.');
    }
  });

  bot.action('TASK_TODAY', async (ctx) => {
    await ctx.answerCbQuery();

    try {
      const telegramUserId = getTelegramUserId(ctx);
      const tasks = await getTodayTasks(telegramUserId);

      await showTaskList(
        ctx,
        tasks,
        '📅 No tienes tareas programadas para hoy.'
      );
    } catch (error) {
      console.error('Error al listar tareas de hoy:', error);
      await ctx.reply('❌ Ocurrió un error al listar tus tareas de hoy.');
    }
  });

  bot.action('TASK_OVERDUE', async (ctx) => {
    await ctx.answerCbQuery();

    try {
      const telegramUserId = getTelegramUserId(ctx);
      const tasks = await getOverdueTasks(telegramUserId);

      await showTaskList(
        ctx,
        tasks,
        '✅ No tienes tareas vencidas.'
      );
    } catch (error) {
      console.error('Error al listar tareas vencidas:', error);
      await ctx.reply('❌ Ocurrió un error al listar tus tareas vencidas.');
    }
  });

  bot.action('TASK_DETAIL', async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.reply(
      [
        '🔎 Para ver el detalle de una tarea usa:',
        '',
        '/ver ID_DE_LA_TAREA',
        '',
        'Ejemplo:',
        '/ver 664a1234567890abcdef1234'
      ].join('\n')
    );
  });

  bot.action('TASK_EDIT', async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.reply(
      [
        '✏️ La edición paso a paso la implementaremos en una siguiente mejora.',
        '',
        'Por ahora puedes editar desde Postman usando:',
        'PATCH /api/tasks/:id'
      ].join('\n')
    );
  });

  bot.action('TASK_COMPLETE', async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.reply(
      [
        '✅ Para completar una tarea usa:',
        '',
        '/hecho ID_DE_LA_TAREA',
        '',
        'Ejemplo:',
        '/hecho 664a1234567890abcdef1234'
      ].join('\n')
    );
  });

  bot.action('TASK_DELETE', async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.reply(
      [
        '🗑️ Para eliminar una tarea usa:',
        '',
        '/eliminar ID_DE_LA_TAREA',
        '',
        'Ejemplo:',
        '/eliminar 664a1234567890abcdef1234',
        '',
        'Nota: según la decisión técnica actual, la eliminación es lógica.'
      ].join('\n')
    );
  });

  bot.action('TASK_HELP', async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.reply(
      [
        '❓ Comandos disponibles:',
        '',
        '/start - Iniciar el bot',
        '/help - Ver ayuda',
        '/menu - Mostrar menú principal',
        '/agregar título - Crear tarea',
        '/listar - Listar pendientes',
        '/hoy - Ver tareas de hoy',
        '/vencidas - Ver tareas vencidas',
        '/ver ID - Ver detalle',
        '/hecho ID - Completar tarea',
        '/eliminar ID - Eliminar tarea'
      ].join('\n')
    );
  });
};

module.exports = {
  registerActions,
  getPendingTasks,
  getTodayTasks,
  getOverdueTasks,
  showTaskList,
  formatTask,
  formatDate,
  getTelegramUserId
};