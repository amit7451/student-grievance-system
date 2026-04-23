const express = require('express');
const Grievance = require('../models/Grievance');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All grievance routes are protected
router.use(protect);

// GET /api/grievances/search?title=xyz  — must come BEFORE /:id
router.get('/search', async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ message: 'Search query "title" is required' });
    }

    const grievances = await Grievance.find({
      student: req.student._id,
      title: { $regex: title, $options: 'i' }
    }).sort({ createdAt: -1 });

    res.json({ count: grievances.length, grievances });
  } catch (err) {
    res.status(500).json({ message: 'Server error during search', error: err.message });
  }
});

// POST /api/grievances  — Submit a new grievance
router.post('/', async (req, res) => {
  try {
    const { title, description, category, status } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    const grievance = await Grievance.create({
      title,
      description,
      category,
      status: status || 'Pending',
      student: req.student._id
    });

    res.status(201).json({ message: 'Grievance submitted successfully', grievance });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while submitting grievance', error: err.message });
  }
});

// GET /api/grievances  — View all grievances for the logged-in student
router.get('/', async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;
    const filter = { student: req.student._id };

    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Grievance.countDocuments(filter);
    const grievances = await Grievance.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      grievances
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching grievances', error: err.message });
  }
});

// GET /api/grievances/:id  — View a specific grievance
router.get('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findOne({
      _id: req.params.id,
      student: req.student._id
    });

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found or unauthorized' });
    }

    res.json({ grievance });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid grievance ID' });
    }
    res.status(500).json({ message: 'Server error while fetching grievance', error: err.message });
  }
});

// PUT /api/grievances/:id  — Update a grievance
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category, status } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (status) updates.status = status;

    const grievance = await Grievance.findOneAndUpdate(
      { _id: req.params.id, student: req.student._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found or unauthorized' });
    }

    res.json({ message: 'Grievance updated successfully', grievance });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid grievance ID' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while updating grievance', error: err.message });
  }
});

// DELETE /api/grievances/:id  — Delete a grievance
router.delete('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findOneAndDelete({
      _id: req.params.id,
      student: req.student._id
    });

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found or unauthorized' });
    }

    res.json({ message: 'Grievance deleted successfully', grievance });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid grievance ID' });
    }
    res.status(500).json({ message: 'Server error while deleting grievance', error: err.message });
  }
});

module.exports = router;
