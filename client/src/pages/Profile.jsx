import { useSelector } from 'react-redux'
import { UserIcon } from '@heroicons/react/24/outline'

function Profile() {
  const { user } = useSelector(state => state.auth)

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information.</p>
      </div>
      <div className="border-t border-gray-200">
        <div className="flex items-center px-4 py-5 sm:px-6">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-primary-600" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 px-4 py-5 sm:px-6">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Account type</dt>
            <dd className="mt-1 text-sm text-gray-900">{user?.isAdmin ? 'Administrator' : 'User'}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Member since</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(user?.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default Profile 