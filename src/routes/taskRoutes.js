const express = require('express');

const taskController = require('../controllers/taskController');

const router = express.Router();

router.post('/', taskController.createTask);

router.get('/', taskController.getTasks);

router.get('/overdue', taskController.getOverdueTasks);

router.get('/:id', taskController.getTaskById);

router.patch('/:id', taskController.updateTask);

router.patch('/:id/complete', taskController.completeTask);

router.patch('/:id/postpone', taskController.postponeTask);

router.delete('/:id', taskController.deleteTask);

module.exports = router;