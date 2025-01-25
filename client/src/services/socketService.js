import { io } from 'socket.io-client';
import { updateTicketInRealtime, removeTicketInRealtime } from '../store/slices/ticketSlice';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.store = null;
  }

  init(store) {
    this.store = store;
    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('ticketCreated', (ticket) => {
      this.store.dispatch(updateTicketInRealtime(ticket));
    });

    this.socket.on('ticketUpdated', (ticket) => {
      this.store.dispatch(updateTicketInRealtime(ticket));
    });

    this.socket.on('ticketDeleted', (ticketId) => {
      this.store.dispatch(removeTicketInRealtime(ticketId));
    });

    this.socket.on('newMessage', (ticket) => {
      this.store.dispatch(updateTicketInRealtime(ticket));
    });
  }

  joinTicket(ticketId) {
    if (this.socket) {
      this.socket.emit('joinTicket', ticketId);
    }
  }

  leaveTicket(ticketId) {
    if (this.socket) {
      this.socket.emit('leaveTicket', ticketId);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService(); 