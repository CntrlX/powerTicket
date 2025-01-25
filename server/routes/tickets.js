const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed!'));
  }
});

// @route   POST api/tickets
// @desc    Create a new ticket
// @access  Private
router.post('/', [auth, upload.array('attachments', 5)], async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;
    const attachments = req.files ? req.files.map(file => file.filename) : [];

    const newTicket = new Ticket({
      title,
      description,
      priority,
      category,
      attachments,
      user: req.user.id,
      status: 'open'
    });

    const ticket = await newTicket.save();

    // Emit socket event for new ticket
    req.io.emit('ticketCreated', ticket);

    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tickets
// @desc    Get all tickets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('user', ['name', 'email'])
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tickets/:id
// @desc    Get ticket by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', ['name', 'email'])
      .populate('messages.user', ['name', 'email']);
    
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tickets/:id
// @desc    Update ticket
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Make sure user is ticket owner or admin
    if (ticket.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('user', ['name', 'email']);

    // Emit socket event for ticket update
    req.io.emit('ticketUpdated', ticket);

    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tickets/:id/messages
// @desc    Add message to ticket
// @access  Private
router.post('/:id/messages', [auth, upload.array('attachments', 5)], async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    const attachments = req.files ? req.files.map(file => file.filename) : [];
    
    const newMessage = {
      user: req.user.id,
      text: req.body.text,
      attachments
    };

    ticket.messages.unshift(newMessage);
    await ticket.save();

    const populatedTicket = await Ticket.findById(req.params.id)
      .populate('user', ['name', 'email'])
      .populate('messages.user', ['name', 'email']);

    // Emit socket event for new message
    req.io.to(`ticket-${req.params.id}`).emit('newMessage', populatedTicket);

    res.json(populatedTicket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/tickets/:id
// @desc    Delete ticket
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Make sure user is ticket owner or admin
    if (ticket.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await ticket.remove();

    // Emit socket event for ticket deletion
    req.io.emit('ticketDeleted', req.params.id);

    res.json({ msg: 'Ticket removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 