import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicket, addMessage, updateTicket } from '../../services/ticketService';
import { useAuth } from '../../contexts/AuthContext';
import { DocumentPlusIcon, XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import {
  joinTicketRoom,
  leaveTicketRoom,
  subscribeToMessages,
  unsubscribeFromMessages
} from '../../services/socketService';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const priorityClasses = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const statusClasses = {
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  closed: 'bg-gray-100 text-gray-800'
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTicket();
    joinTicketRoom(id);
    subscribeToMessages(id, handleNewMessage);

    return () => {
      leaveTicketRoom(id);
      unsubscribeFromMessages(id, handleNewMessage);
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicket = async () => {
    try {
      const data = await getTicket(id);
      setTicket(data);
      setStatus(data.status);
      setError('');
    } catch (error) {
      setError(error.message || 'Failed to fetch ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    setTicket(prevTicket => ({
      ...prevTicket,
      messages: [...prevTicket.messages, data.message]
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;

    setSending(true);
    const formData = new FormData();
    formData.append('content', message);
    files.forEach(file => {
      formData.append('attachments', file);
    });

    try {
      await addMessage(id, formData);
      setMessage('');
      setFiles([]);
      await fetchTicket();
    } catch (error) {
      setError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await updateTicket(id, { status });
      await fetchTicket();
    } catch (error) {
      setError(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchTicket}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {ticket.title}
            </h3>
            <div className="flex items-center space-x-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field"
                disabled={ticket.status === 'closed'}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || status === ticket.status}
                className="btn-primary"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className={classNames(
                statusClasses[ticket.status],
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize'
              )}>
                {ticket.status}
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className={classNames(
                priorityClasses[ticket.priority],
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize'
              )}>
                {ticket.priority}
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Created on {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-lg font-medium text-gray-900">Description</h4>
          <div className="mt-2 text-sm text-gray-500">
            {ticket.description}
          </div>
          {ticket.attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Attachments</h4>
              <ul className="mt-2 divide-y divide-gray-100">
                {ticket.attachments.map((file, index) => (
                  <li key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <PaperClipIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span className="ml-2 text-sm text-gray-500">{file.filename}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {ticket.status !== 'closed' && (
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-lg font-medium text-gray-900">Messages</h4>
            <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
              {ticket.messages.map((msg, index) => (
                <div
                  key={index}
                  className={classNames(
                    'flex',
                    msg.sender._id === user.id ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={classNames(
                      'rounded-lg px-4 py-2 max-w-lg',
                      msg.sender._id === user.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <div className="text-sm">{msg.content}</div>
                    {msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((file, fileIndex) => (
                          <div key={fileIndex} className="flex items-center">
                            <PaperClipIcon className="h-4 w-4 text-current" aria-hidden="true" />
                            <span className="ml-1 text-xs">{file.filename}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-1 text-xs opacity-75">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="input-field"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="form-label">Attachments</label>
                <div className="mt-1">
                  <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">Up to 5 files, max 5MB each</p>
                    </div>
                  </div>
                </div>
                {files.length > 0 && (
                  <ul className="mt-4 divide-y divide-gray-100">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between py-4">
                        <div className="flex min-w-0 gap-x-4">
                          <div className="min-w-0 flex-auto">
                            <p className="text-sm font-semibold leading-6 text-gray-900">{file.name}</p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={sending || (!message.trim() && files.length === 0)}
                  className="btn-primary"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 