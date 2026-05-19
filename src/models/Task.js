const mongoose = require('mongoose');

const TASK_STATUS = {
  PENDING: 'pendiente',
  COMPLETED: 'completada',
  DELETED: 'eliminada',
};

const taskSchema = new mongoose.Schema(
  {
    telegramUserId: {
      type: String,
      required: [true, 'El identificador de Telegram es obligatorio'],
      trim: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, 'El título de la tarea es obligatorio'],
      trim: true,
      minlength: [2, 'El título debe tener al menos 2 caracteres'],
      maxlength: [120, 'El título no debe superar los 120 caracteres'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no debe superar los 500 caracteres'],
      default: '',
    },

    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
      index: true,
    },

    dueDate: {
      type: Date,
      default: null,
      index: true,
    },

    reminderSent: {
      type: Boolean,
      default: false,
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

taskSchema.index({
  telegramUserId: 1,
  status: 1,
  dueDate: 1,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = {
  Task,
  TASK_STATUS,
};