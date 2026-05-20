const TIMEZONE = process.env.TIMEZONE || 'America/Lima';

const formatDate = (date) => {
  if (!date) {
    return 'Sin fecha';
  }

  return new Date(date).toLocaleString('es-PE', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatOptionalDate = (date) => {
  if (!date) {
    return null;
  }

  return formatDate(date);
};

const formatStatus = (status) => {
  const statusMap = {
    pendiente: 'pendiente',
    completada: 'completada',
    eliminada: 'eliminada',
  };

  return statusMap[status] || 'pendiente';
};

const formatDescription = (description) => {
  if (!description || !description.trim()) {
    return null;
  }

  return description.trim();
};

const formatTaskSummary = (task, index = null) => {
  const lines = [];

  if (index !== null) {
    lines.push(`${index + 1}. 📝 ${task.title}`);
  } else {
    lines.push(`📝 ${task.title}`);
  }

  lines.push(`Estado: ${formatStatus(task.status)}`);
  lines.push(`Fecha: ${formatDate(task.dueDate)}`);

  const description = formatDescription(task.description);

  if (description) {
    lines.push(`Descripción: ${description}`);
  }

  return lines.join('\n');
};

const formatTaskList = (tasks) => {
  return tasks
    .map((task, index) => formatTaskSummary(task, index))
    .join('\n\n');
};

const formatTaskCreated = (task) => {
  const lines = [
    '✅ Tarea registrada correctamente.',
    '',
    `📝 ${task.title}`,
    `Estado: ${formatStatus(task.status)}`,
    `Fecha: ${formatDate(task.dueDate)}`,
  ];

  const description = formatDescription(task.description);

  if (description) {
    lines.push(`Descripción: ${description}`);
  }

  return lines.join('\n');
};

const formatTaskDetail = (task) => {
  const lines = [
    '🔎 Detalle de tarea',
    '',
    `📝 ${task.title}`,
    `Estado: ${formatStatus(task.status)}`,
    `Fecha: ${formatDate(task.dueDate)}`,
  ];

  const description = formatDescription(task.description);

  if (description) {
    lines.push(`Descripción: ${description}`);
  }

  lines.push(`Recordatorio enviado: ${task.reminderSent ? 'Sí' : 'No'}`);

  const completedAt = formatOptionalDate(task.completedAt);

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
    `Fecha: ${formatDate(task.dueDate)}`,
  ];

  const completedAt = formatOptionalDate(task.completedAt);

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
    `Fecha: ${formatDate(task.dueDate)}`,
  ].join('\n');
};

const formatDeleteConfirmation = (task) => {
  const lines = [
    '⚠️ Confirmar eliminación',
    '',
    `📝 ${task.title}`,
    `Estado: ${formatStatus(task.status)}`,
    `Fecha: ${formatDate(task.dueDate)}`,
  ];

  const description = formatDescription(task.description);

  if (description) {
    lines.push(`Descripción: ${description}`);
  }

  lines.push('');
  lines.push('¿Estás seguro de que deseas eliminar esta tarea?');

  return lines.join('\n');
};

const truncateButtonText = (text, maxLength = 35) => {
  if (!text) {
    return 'Sin título';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
};

module.exports = {
  formatDate,
  formatOptionalDate,
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