const express = require('express');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const Tenant = require('../models/Tenant');
const { authenticateToken, requireMember } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and member access
router.use(authenticateToken);
router.use(requireMember);

// Create a note
router.post('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, content } = req.body;
    const tenant = await Tenant.findById(req.user.tenantId._id);

    // Check note limit for free plan
    if (tenant.subscription === 'free') {
      const noteCount = await Note.countDocuments({ tenantId: req.user.tenantId._id });
      if (noteCount >= tenant.noteLimit) {
        return res.status(403).json({ 
          message: 'Note limit reached. Upgrade to Pro for unlimited notes.',
          limitReached: true
        });
      }
    }

    const note = new Note({
      title,
      content,
      author: req.user._id,
      tenantId: req.user.tenantId._id
    });

    await note.save();
    await note.populate('author', 'email');

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all notes for the current tenant
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ tenantId: req.user.tenantId._id })
      .populate('author', 'email')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      tenantId: req.user.tenantId._id 
    }).populate('author', 'email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note
router.put('/:id', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, content } = req.body;
    
    const note = await Note.findOneAndUpdate(
      { 
        _id: req.params.id, 
        tenantId: req.user.tenantId._id 
      },
      { title, content },
      { new: true }
    ).populate('author', 'email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      tenantId: req.user.tenantId._id 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
