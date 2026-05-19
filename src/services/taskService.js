const { Task, TASK_STATUS } = require('../models/Task');

const createTask = async (taskData) => {
  const { telegramUserId, title, description, dueDate } = taskData;

  if (!telegramUserId) {
    throw new Error('telegramUserId es obligatorio');
  }

  if (!title) {
    throw new Error('El título de la tarea es obligatorio');
  }

  const task = await Task.create({
    telegramUserId,
    title,
    description: description || '',
    dueDate: dueDate || null,
    status: TASK_STATUS.PENDING,
    reminderSent: false,
    completedAt: null,
  });

  return task;
};

const getTasks = async (filters = {}) => {
  const query = {
    status: { $ne: TASK_STATUS.DELETED },
  };

  if (filters.telegramUserId) {
    query.telegramUserId = filters.telegramUserId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const tasks = await Task.find(query).sort({
    dueDate: 1,
    createdAt: -1,
  });

  return tasks;
};

module.exports = {
  createTask,
  getTasks,
};