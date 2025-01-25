import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getTickets } from '../../store/slices/ticketSlice'
import { PlusIcon } from '@heroicons/react/24/outline'

function TicketList() {
  const dispatch = useDispatch()
  const { tickets, loading } = useSelector(state => state.tickets)
  const { user } = useSelector(state => state.auth)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  })

  useEffect(() => {
    dispatch(getTickets())
  }, [dispatch])

  const filteredTickets = tickets.filter(ticket => {
    if (!user?.isAdmin && ticket.user._id !== user?._id) return false
    if (filters.status && ticket.status !== filters.status) return false
    if (filters.priority && ticket.priority !== filters.priority) return false
    if (filters.category && ticket.category !== filters.category) return false
    return true
  })

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white shadow sm:rounded-lg">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className="border-t border-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Tickets</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all tickets in the system.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/tickets/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Ticket
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <div className="bg-gray-50 px-4 py-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="general">General</option>
                  <option value="feature-request">Feature Request</option>
                </select>
              </div>

              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Priority
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                          ${ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : ''}
                          ${ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' : ''}
                        `}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${ticket.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                          ${ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${ticket.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                          ${ticket.priority === 'urgent' ? 'bg-purple-100 text-purple-800' : ''}
                        `}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                        {ticket.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketList 