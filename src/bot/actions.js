const { Markup } = require('telegraf');
const taskService = require('../services/taskService');

const {
  formatDate,
  formatTaskList,
  formatTaskCompleted,
  formatTaskDeleted,
  formatDeleteConfirmation,
  truncateButtonText,
} = require('../utils/messageUtils');

const CALLBACK_PREFIX = {
  COMPLETE_SELECT: 'COMPLETE_SELECT',
  DELETE_SELECT: 'DELETE_SELECT',
  DELETE_CONFIRM: 'DELETE_CONFIRM',
  DELETE_CANCEL: 'DELETE_CANCEL',
};

const getTelegramUserId = (ctx) => {
  return String(ctx.from.id);
};

const buildTaskButtons = (tasks, prefix) => {
  return tasks.map((task) => [
    Markup.button.callback(
      truncateButtonText(task.title),
      `${prefix}:${task._id}`
    ),
  ]);
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
    day: '2-digit',
  }).format(now);

  return tasks.filter((task) => {
    if (!task.dueDate) return false;

    const taskDateInPeru = new Intl.DateTimeFormat('en-CA', {
      timeZone: process.env.TIMEZONE || 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(task.dueDate));

    return taskDateInPeru === todayInPeru;
  });
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

const showTaskList = async (ctx, tasks, emptyMessage) => {
  if (!tasks || tasks.length === 0) {
    await ctx.reply(emptyMessage);
    return;
  }

  await ctx.reply(formatTaskList(tasks));
};

const showCompleteTaskButtons = async (ctx) => {
  const telegramUserId = getTelegramUserId(ctx);
  const tasks = await getPendingTasks(telegramUserId);

  if (!tasks || tasks.length === 0) {
    await ctx.reply('✅ No tienes tareas pendientes para completar.');
    return;
  }

  await ctx.reply(
    '✅ Selecciona la tarea que deseas completar:',
    Markup.inlineKeyboard(buildTaskButtons(tasks, CALLBACK_PREFIX.COMPLETE_SELECT))
  );
};

const showDeleteTaskButtons = async (ctx) => {
  const telegramUserId = getTelegramUserId(ctx);
  const tasks = await getPendingTasks(telegramUserId);

  if (!tasks || tasks.length === 0) {
    await ctx.reply('🗑️ No tienes tareas pendientes para eliminar.');
    return;
  }

  await ctx.reply(
    '🗑️ Selecciona la tarea que deseas eliminar:',
    Markup.inlineKeyboard(buildTaskButtons(tasks, CALLBACK_PREFIX.DELETE_SELECT))
  );
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
        '/agregar estudiar redes',
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
        '🔎 Para ver el detalle de una tarea, por ahora usa el comando técnico:',
        '',
        '/ver <id>',
        '',
        'Más adelante lo mejoraremos para seleccionar la tarea desde botones.',
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
        'PATCH /api/tasks/:id',
      ].join('\n')
    );
  });

  bot.action('TASK_COMPLETE', async (ctx) => {
    await ctx.answerCbQuery();

    try {
      await showCompleteTaskButtons(ctx);
    } catch (error) {
      console.error('Error al mostrar tareas para completar:', error);
      await ctx.reply('❌ Ocurrió un error al cargar tus tareas pendientes.');
    }
  });

  bot.action(/^COMPLETE_SELECT:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();

    try {
      const telegramUserId = getTelegramUserId(ctx);
      const taskId = ctx.match[1];

      const task = await completeTask(taskId, telegramUserId);

      if (!task) {
        await ctx.reply('⚠️ No encontré esa tarea o ya no está pendiente.');
        return;
      }

      await ctx.reply(formatTaskCompleted(task));
    } catch (error) {
      console.error('Error al completar tarea con botón:', error);
      await ctx.reply('❌ Ocurrió un error al completar la tarea.');
    }
  });

  bot.action('TASK_DELETE', async (ctx) => {
    await ctx.answerCbQuery();

    try {
      await showDeleteTaskButtons(ctx);
    } catch (error) {
      console.error('Error al mostrar tareas para eliminar:', error);
      await ctx.reply('❌ Ocurrió un error al cargar tus tareas.');
    }
  });

  bot.action(/^DELETE_SELECT:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();

    try {
      const telegramUserId = getTelegramUserId(ctx);
      const taskId = ctx.match[1];

      const task = await getTaskById(taskId, telegramUserId);

      if (!task || task.status === 'eliminada') {
        await ctx.reply('⚠️ No encontré esa tarea o ya fue eliminada.');
        return;
      }

      await ctx.reply(
        formatDeleteConfirmation(task),
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '✅ Sí, eliminar',
              `${CALLBACK_PREFIX.DELETE_CONFIRM}:${task._id}`
            ),
          ],
          [
            Markup.button.callback(
              '❌ Cancelar',
              `${CALLBACK_PREFIX.DELETE_CANCEL}:${task._id}`
            ),
          ],
        ])
      );
    } catch (error) {
      console.error('Error al preparar confirmación de eliminación:', error);
      await ctx.reply('❌ Ocurrió un error al preparar la eliminación.');
    }
  });

  bot.action(/^DELETE_CONFIRM:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();

    try {
      const telegramUserId = getTelegramUserId(ctx);
      const taskId = ctx.match[1];

      const task = await deleteTask(taskId, telegramUserId);

      if (!task) {
        await ctx.reply('⚠️ No encontré esa tarea o ya fue eliminada.');
        return;
      }

      await ctx.reply(formatTaskDeleted(task));
    } catch (error) {
      console.error('Error al confirmar eliminación:', error);
      await ctx.reply('❌ Ocurrió un error al eliminar la tarea.');
    }
  });

  bot.action(/^DELETE_CANCEL:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery('Eliminación cancelada.');

    await ctx.reply('❌ Eliminación cancelada. No se modificó ninguna tarea.');
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
        '',
        'También puedes usar los botones del menú para completar o eliminar tareas sin copiar identificadores.',
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
  formatDate,
  getTelegramUserId,
};