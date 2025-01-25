const Ticket = require('../models/Ticket');
const path = require('path');
const fs = require('fs').promises;

// Create new ticket
const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const files = req.files || [];

    const attachments = files.map(file => ({
      filename: file.filename,
      path: file.path
    }));

    const ticket = new Ticket({
      title,
      description,
      priority,
      creator: req.user.id,
      attachments
    });

    await ticket.save();

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Error creating ticket' });
  }
};

// Get all tickets for a user
const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ creator: req.user.id })
      .sort({ createdAt: -1 })
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email');

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};

// Get single ticket
const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email')
      .populate('messages.sender', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.creator._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Error fetching ticket' });
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    const files = req.files || [];

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const newAttachments = files.map(file => ({
      filename: file.filename,
      path: file.path
    }));

    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    ticket.priority = priority || ticket.priority;
    ticket.status = status || ticket.status;
    ticket.attachments = [...ticket.attachments, ...newAttachments];

    await ticket.save();

    res.json({
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Error updating ticket' });
  }
};

// Add message to ticket
const addMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const files = req.files || [];

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const attachments = files.map(file => ({
      filename: file.filename,
      path: file.path
    }));

    ticket.messages.push({
      sender: req.user.id,
      content,
      attachments
    });

    await ticket.save();

    // Emit socket event for real-time updates
    req.io.to(req.params.id).emit('newMessage', {
      ticketId: req.params.id,
      message: ticket.messages[ticket.messages.length - 1]
    });

    res.json({
      message: 'Message added successfully',
      ticketMessage: ticket.messages[ticket.messages.length - 1]
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Error adding message' });
  }
};

// Delete ticket
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated files
    for (const attachment of ticket.attachments) {
      try {
        await fs.unlink(attachment.path);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    // Delete messages attachments
    for (const message of ticket.messages) {
      for (const attachment of message.attachments) {
        try {
          await fs.unlink(attachment.path);
        } catch (error) {
          console.error('Error deleting message attachment:', error);
        }
      }
    }

    await ticket.remove();

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ message: 'Error deleting ticket' });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getTicket,
  updateTicket,
  addMessage,
  deleteTicket
}; 