const formatDate = (date) => {
  if (!date) return null;

  return new Date(date).toLocaleString('es-PE', {
    timeZone: process.env.TIMEZONE || 'America/Lima',
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const formatStatus = (status) => {
  const statusMap = {
    pendiente: 'Pendiente',
    completada: 'Completada',
    eliminada: 'Eliminada',
  };

  return statusMap[status] || status || 'Sin estado';
};

const formatTaskSummary = (task, index = null) => {
  const lines = [];

  if (index !== null) {
    lines.push(`${index + 1}. 📝 ${task.title}`);
  } else {
    lines.push(`📝 ${task.title}`);
  }

  lines.push(`Estado: ${formatStatus(task.status)}`);

  const formattedDate = formatDate(task.dueDate);
  if (formattedDate) {
    lines.push(`Fecha: ${formattedDate}`);
  }

  if (task.description) {
    lines.push(`Descripción: ${task.description}`);
  }

  return lines.join('\n');
};

const formatTaskList = (tasks) => {
  return tasks.map((task, index) => formatTaskSummary(task, index)).join('\n\n');
};

const formatTaskCreated = (task) => {
  const lines = [
    '✅ Tarea registrada correctamente.',
    '',
    `📝 ${task.title}`,
    `Estado: ${formatStatus(task.status)}`,
  ];

  const formattedDate = formatDate(task.dueDate);
  if (formattedDate) {
    lines.push(`Fecha: ${formattedDate}`);
  }

  if (task.description) {
    lines.push(`Descripción: ${task.description}`);
  }

  return lines.join('\n');
};

const formatTaskDetail = (task) => {
  const lines = [
    '🔎 Detalle de tarea',
    '',
    `📝 ${task.title}`,
    `Estado: ${formatStatus(task.status)}`,
  ];

  const formattedDate = formatDate(task.dueDate);
  if (formattedDate) {
    lines.push(`Fecha: ${formattedDate}`);
  }

  if (task.description) {
    lines.push(`Descripción: ${task.description}`);
  }

  lines.push(`Recordatorio enviado: ${task.reminderSent ? 'Sí' : 'No'}`);

  const completedAt = formatDate(task.completedAt);
  if (completedAt) {
    lines.push(`Completada en: ${completedAt}`);
  }

  return lines.join('\n');
};

const formatTaskCompleted = (task) => {
  const lines = [
    '✅ Tarea completada correctamente.',
    '',
    `📝 ${task.title}`,
    `Estado: ${formatStatus(task.status)}`,
  ];

  const completedAt = formatDate(task.completedAt);
  if (completedAt) {
    lines.push(`Completada en: ${completedAt}`);
  }

  return lines.join('\n');
};

const formatTaskDeleted = (task) => {
  return [
    '🗑️ Tarea eliminada correctamente.',
    '',
    `📝 ${task.title}`,
    `Estado: ${formatStatus(task.status)}`,
  ].join('\n');
};

const formatDeleteConfirmation = (task) => {
  const lines = [
    '⚠️ Confirmar eliminación',
    '',
    `📝 ${task.title}`,
  ];

  const formattedDate = formatDate(task.dueDate);
  if (formattedDate) {
    lines.push(`Fecha: ${formattedDate}`);
  }

  if (task.description) {
    lines.push(`Descripción: ${task.description}`);
  }

  lines.push('');
  lines.push('¿Estás seguro de que deseas eliminar esta tarea?');

  return lines.join('\n');
};

const truncateButtonText = (text, maxLength = 35) => {
  if (!text) return 'Sin título';

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
};

module.exports = {
  formatDate,
  formatStatus,
  formatTaskSummary,
  formatTaskList,
  formatTaskCreated,
  formatTaskDetail,
  formatTaskCompleted,
  formatTaskDeleted,
  formatDeleteConfirmation,
  truncateButtonText,
};