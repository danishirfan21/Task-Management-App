const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
      order: 1,
      createdAt: -1,
    });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post(
  '/',
  [auth, body('title', 'Title is required').not().isEmpty()],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, priority } = req.body;

      // Get the current highest order value for this user
      const maxOrderTask = await Task.findOne({ user: req.user.id })
        .sort({ order: -1 })
        .limit(1);

      const nextOrder = maxOrderTask ? maxOrderTask.order + 1 : 0;

      const newTask = new Task({
        title,
        description: description || '',
        priority: priority || 'medium',
        order: nextOrder,
        user: req.user.id,
      });

      const task = await newTask.save();
      res.json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, completed, priority } = req.body;

    // Find task by id and user
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    task.title = title !== undefined ? title : task.title;
    task.description =
      description !== undefined ? description : task.description;
    task.completed = completed !== undefined ? completed : task.completed;
    task.priority = priority !== undefined ? priority : task.priority;
    task.updatedAt = Date.now();

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find and delete task by id and user
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/tasks/reorder
// @desc    Reorder tasks
// @access  Private
router.put('/reorder', auth, async (req, res) => {
  try {
    const { tasks } = req.body; // Array of { id, order } objects

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Tasks must be an array' });
    }

    // Update all tasks with new order
    const updatePromises = tasks.map((taskUpdate) =>
      Task.findOneAndUpdate(
        { _id: taskUpdate.id, user: req.user.id },
        { order: taskUpdate.order, updatedAt: Date.now() },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    // Return updated tasks
    const updatedTasks = await Task.find({ user: req.user.id }).sort({
      order: 1,
    });
    res.json(updatedTasks);
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
