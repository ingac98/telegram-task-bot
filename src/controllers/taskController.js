const taskService = require('../services/taskService');

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body);

    return res.status(201).json({
      ok: true,
      message: 'Tarea creada correctamente',
      data: task,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message || 'Error al crear la tarea',
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const { telegramUserId, status } = req.query;

    const tasks = await taskService.getTasks({
      telegramUserId,
      status,
    });

    return res.status(200).json({
      ok: true,
      message: 'Tareas obtenidas correctamente',
      total: tasks.length,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || 'Error al obtener las tareas',
    });
  }
};

module.exports = {
  createTask,
  getTasks,
};