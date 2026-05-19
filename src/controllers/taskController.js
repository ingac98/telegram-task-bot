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

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await taskService.getTaskById(id);

    return res.status(200).json({
      ok: true,
      message: 'Tarea obtenida correctamente',
      data: task,
    });
  } catch (error) {
    return res.status(404).json({
      ok: false,
      message: error.message || 'Error al obtener la tarea',
    });
  }
};

const getOverdueTasks = async (req, res) => {
  try {
    const { telegramUserId } = req.query;

    const tasks = await taskService.getOverdueTasks({
      telegramUserId,
    });

    return res.status(200).json({
      ok: true,
      message: 'Tareas vencidas obtenidas correctamente',
      total: tasks.length,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || 'Error al obtener tareas vencidas',
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await taskService.updateTask(id, req.body);

    return res.status(200).json({
      ok: true,
      message: 'Tarea actualizada correctamente',
      data: task,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message || 'Error al actualizar la tarea',
    });
  }
};

const completeTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await taskService.completeTask(id);

    return res.status(200).json({
      ok: true,
      message: 'Tarea completada correctamente',
      data: task,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message || 'Error al completar la tarea',
    });
  }
};

const postponeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { dueDate } = req.body;

    const task = await taskService.postponeTask(id, dueDate);

    return res.status(200).json({
      ok: true,
      message: 'Tarea pospuesta correctamente',
      data: task,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message || 'Error al posponer la tarea',
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await taskService.deleteTask(id);

    return res.status(200).json({
      ok: true,
      message: 'Tarea eliminada correctamente',
      data: task,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message || 'Error al eliminar la tarea',
    });
  }
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