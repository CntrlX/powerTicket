import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getTickets } from '../store/slices/ticketSlice'
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const stats = [
  { name: 'Total Tickets', icon: TicketIcon },
  { name: 'Open Tickets', icon: ClockIcon },
  { name: 'Resolved Tickets', icon: CheckCircleIcon },
  { name: 'Closed Tickets', icon: XCircleIcon }
]

function Dashboard() {
  const dispatch = useDispatch()
  const { tickets, loading } = useSelector(state => state.tickets)
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(getTickets())
  }, [dispatch])

  const getTicketStats = () => {
    const userTickets = user?.isAdmin ? tickets : tickets.filter(ticket => ticket.user._id === user?._id)
    return [
      { name: 'Total Tickets', count: userTickets.length, icon: TicketIcon },
      { name: 'Open Tickets', count: userTickets.filter(t => t.status === 'open').length, icon: ClockIcon },
      { name: 'Resolved Tickets', count: userTickets.filter(t => t.status === 'resolved').length, icon: CheckCircleIcon },
      { name: 'Closed Tickets', count: userTickets.filter(t => t.status === 'closed').length, icon: XCircleIcon }
    ]
  }

  const ticketStats = getTicketStats()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ticketStats.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{item.count}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/tickets"
                  className="font-medium text-primary-700 hover:text-primary-900"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  scope="col"
                >
                  Title
                </th>
                <th
                  className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  scope="col"
                >
                  Status
                </th>
                <th
                  className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  scope="col"
                >
                  Priority
                </th>
                <th
                  className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  scope="col"
                >
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.slice(0, 5).map((ticket) => (
                <tr key={ticket._id} className="bg-white">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                      ${ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : ''}
                      ${ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${ticket.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                      ${ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${ticket.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                      ${ticket.priority === 'urgent' ? 'bg-purple-100 text-purple-800' : ''}
                    `}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 