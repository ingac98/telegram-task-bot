const mongoose = require('mongoose');

const { Task, TASK_STATUS } = require('../models/Task');

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('ID de tarea no válido');
  }
};

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

const getTaskById = async (id) => {
  validateObjectId(id);

  const task = await Task.findOne({
    _id: id,
    status: { $ne: TASK_STATUS.DELETED },
  });

  if (!task) {
    throw new Error('Tarea no encontrada');
  }

  return task;
};

const getOverdueTasks = async (filters = {}) => {
  const now = new Date();

  const query = {
    status: TASK_STATUS.PENDING,
    dueDate: { $ne: null, $lt: now },
  };

  if (filters.telegramUserId) {
    query.telegramUserId = filters.telegramUserId;
  }

  const tasks = await Task.find(query).sort({
    dueDate: 1,
  });

  return tasks;
};

const updateTask = async (id, updateData) => {
  validateObjectId(id);

  const allowedFields = ['title', 'description', 'dueDate'];
  const dataToUpdate = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updateData, field)) {
      dataToUpdate[field] = updateData[field];
    }
  });

  if (dataToUpdate.title !== undefined && !dataToUpdate.title) {
    throw new Error('El título no puede estar vacío');
  }

  if (dataToUpdate.dueDate !== undefined) {
    dataToUpdate.reminderSent = false;
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: id,
      status: { $ne: TASK_STATUS.DELETED },
    },
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!task) {
    throw new Error('Tarea no encontrada');
  }

  return task;
};

const completeTask = async (id) => {
  validateObjectId(id);

  const task = await Task.findOneAndUpdate(
    {
      _id: id,
      status: TASK_STATUS.PENDING,
    },
    {
      status: TASK_STATUS.COMPLETED,
      completedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!task) {
    throw new Error('Tarea no encontrada o ya completada');
  }

  return task;
};

const postponeTask = async (id, newDueDate) => {
  validateObjectId(id);

  if (!newDueDate) {
    throw new Error('La nueva fecha es obligatoria');
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: id,
      status: TASK_STATUS.PENDING,
    },
    {
      dueDate: newDueDate,
      reminderSent: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!task) {
    throw new Error('Tarea no encontrada o no está pendiente');
  }

  return task;
};

const deleteTask = async (id) => {
  validateObjectId(id);

  const task = await Task.findOneAndUpdate(
    {
      _id: id,
      status: { $ne: TASK_STATUS.DELETED },
    },
    {
      status: TASK_STATUS.DELETED,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!task) {
    throw new Error('Tarea no encontrada');
  }

  return task;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  getOverdueTasks,
  updateTask,
  completeTask,
  postponeTask,
  deleteTask,
};