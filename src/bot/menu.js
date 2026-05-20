const { Markup } = require('telegraf');

const mainMenu = Markup.inlineKeyboard([
  [
    Markup.button.callback('➕ Agregar tarea', 'TASK_ADD'),
    Markup.button.callback('📌 Listar pendientes', 'TASK_LIST_PENDING')
  ],
  [
    Markup.button.callback('📅 Tareas de hoy', 'TASK_TODAY'),
    Markup.button.callback('⏰ Tareas vencidas', 'TASK_OVERDUE')
  ],
  [
    Markup.button.callback('🔎 Ver detalle', 'TASK_DETAIL'),
    Markup.button.callback('✏️ Editar tarea', 'TASK_EDIT')
  ],
  [
    Markup.button.callback('✅ Completar tarea', 'TASK_COMPLETE'),
    Markup.button.callback('🗑️ Eliminar tarea', 'TASK_DELETE')
  ],
  [
    Markup.button.callback('❓ Ayuda', 'TASK_HELP')
  ]
]);

const showMainMenu = async (ctx) => {
  await ctx.reply(
    '📋 Menú principal de TaskBot\n\nSelecciona una opción:',
    mainMenu
  );
};

module.exports = {
  mainMenu,
  showMainMenu
};