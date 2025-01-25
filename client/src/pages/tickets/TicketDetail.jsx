import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getTicket, updateTicket, addMessage } from '../../store/slices/ticketSlice'
import { PaperClipIcon } from '@heroicons/react/24/outline'
import socketService from '../../services/socketService'

function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentTicket, loading } = useSelector(state => state.tickets)
  const { user } = useSelector(state => state.auth)
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState([])

  useEffect(() => {
    dispatch(getTicket(id))
    socketService.joinTicket(id)
    return () => {
      socketService.leaveTicket(id)
    }
  }, [dispatch, id])

  const handleStatusChange = async (status) => {
    await dispatch(updateTicket({
      ticketId: id,
      ticketData: { status }
    }))
  }

  const handleMessageSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() && attachments.length === 0) return

    const messageData = new FormData()
    messageData.append('text', message)
    attachments.forEach(file => {
      messageData.append('attachments', file)
    })

    await dispatch(addMessage({
      ticketId: id,
      messageData
    }))

    setMessage('')
    setAttachments([])
  }

  if (loading || !currentTicket) {
    return (
      <div className="animate-pulse">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {currentTicket.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Created by {currentTicket.user.name} on {new Date(currentTicket.createdAt).toLocaleDateString()}
            </p>
          </div>
          {(user?.isAdmin || currentTicket.user._id === user?._id) && (
            <div className="flex space-x-3">
              <select
                value={currentTicket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-md border-gray-300 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                ${currentTicket.status === 'open' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${currentTicket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                ${currentTicket.status === 'resolved' ? 'bg-green-100 text-green-800' : ''}
                ${currentTicket.status === 'closed' ? 'bg-gray-100 text-gray-800' : ''}
              `}>
                {currentTicket.status}
              </span>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                ${currentTicket.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                ${currentTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${currentTicket.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                ${currentTicket.priority === 'urgent' ? 'bg-purple-100 text-purple-800' : ''}
              `}>
                {currentTicket.priority}
              </span>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
              {currentTicket.description}
            </dd>
          </div>
          {currentTicket.attachments?.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Attachments</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                  {currentTicket.attachments.map((attachment, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
                    >
                      <div className="flex w-0 flex-1 items-center">
                        <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                        <span className="ml-2 w-0 flex-1 truncate">{attachment}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a
                          href={`${import.meta.env.VITE_API_URL}/uploads/${attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary-600 hover:text-primary-500"
                        >
                          Download
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h4 className="text-lg font-medium text-gray-900">Messages</h4>
          <div className="mt-6 flow-root">
            <ul className="-mb-8">
              {currentTicket.messages?.map((message, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== currentTicket.messages.length - 1 && (
                      <span
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {message.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {message.user.name}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>{message.text}</p>
                        </div>
                        {message.attachments?.length > 0 && (
                          <div className="mt-2">
                            <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                              {message.attachments.map((attachment, index) => (
                                <li
                                  key={index}
                                  className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
                                >
                                  <div className="flex w-0 flex-1 items-center">
                                    <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                                    <span className="ml-2 w-0 flex-1 truncate">{attachment}</span>
                                  </div>
                                  <div className="ml-4 flex-shrink-0">
                                    <a
                                      href={`${import.meta.env.VITE_API_URL}/uploads/${attachment}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-primary-600 hover:text-primary-500"
                                    >
                                      Download
                                    </a>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <form onSubmit={handleMessageSubmit}>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Add a message..."
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className="flex items-center">
                    <label
                      htmlFor="attachments"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-500"
                    >
                      <span>Attach files</span>
                      <input
                        id="attachments"
                        name="attachments"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={(e) => setAttachments(Array.from(e.target.files))}
                        accept="image/*, application/pdf"
                      />
                    </label>
                  </div>
                  {attachments.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {attachments.length} file(s) selected
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || (!message.trim() && attachments.length === 0)}
                  className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetail 