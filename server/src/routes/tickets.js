const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
  createTicket,
  getUserTickets,
  getTicket,
  updateTicket,
  addMessage,
  deleteTicket
} = require('../controllers/ticketController');

// All routes require authentication
router.use(auth);

// Get all tickets for user
router.get('/', getUserTickets);

// Create new ticket
router.post('/', 
  upload.array('attachments', 5),
  handleUploadError,
  createTicket
);

// Get single ticket
router.get('/:id', getTicket);

// Update ticket
router.patch('/:id',
  upload.array('attachments', 5),
  handleUploadError,
  updateTicket
);

// Add message to ticket
router.post('/:id/messages',
  upload.array('attachments', 5),
  handleUploadError,
  addMessage
);

// Delete ticket
router.delete('/:id', deleteTicket);

module.exports = router; 