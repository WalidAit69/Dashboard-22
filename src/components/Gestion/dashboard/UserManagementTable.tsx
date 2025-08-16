import { useState, useMemo } from 'react';
import { ChevronDown, Download, Plus, Trash2, Eye, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const UserManagementTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Sample user data
  const users = [
    {
      id: 1,
      name: 'Zsazsa McCleverty',
      email: 'zmccleverty@soundcloud.com',
      avatar: 'ZM',
      role: 'Maintainer',
      roleIcon: '👤',
      plan: 'Enterprise',
      billing: 'Auto Debit',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Yoko Pottie',
      email: 'ypottie@privacy.gov.au',
      avatar: 'YP',
      role: 'Subscriber',
      roleIcon: '📧',
      plan: 'Basic',
      billing: 'Auto Debit',
      status: 'Inactive'
    },
    {
      id: 3,
      name: 'Wesley Burland',
      email: 'wburland@utexas.edu',
      avatar: 'WB',
      role: 'Editor',
      roleIcon: '⏰',
      plan: 'Team',
      billing: 'Auto Debit',
      status: 'Inactive'
    },
    {
      id: 4,
      name: 'Vladamir Koschek',
      email: 'vkoschek17@abc.net.au',
      avatar: 'VK',
      role: 'Author',
      roleIcon: '✏️',
      plan: 'Team',
      billing: 'Manual - Paypal',
      status: 'Active'
    },
    {
      id: 5,
      name: 'Tyne Widmore',
      email: 'twidmore12@gravatar.com',
      avatar: 'TW',
      role: 'Subscriber',
      roleIcon: '📧',
      plan: 'Team',
      billing: 'Manual - Cash',
      status: 'Pending'
    },
    {
      id: 6,
      name: 'Travus Bruntjen',
      email: 'tbruntjen@sitemeter.com',
      avatar: 'TB',
      role: 'Admin',
      roleIcon: '🛡️',
      plan: 'Enterprise',
      billing: 'Manual - Cash',
      status: 'Active'
    },
    {
      id: 7,
      name: 'Stu Delamaine',
      email: 'sdelamaine@who.int',
      avatar: 'SD',
      role: 'Author',
      roleIcon: '✏️',
      plan: 'Basic',
      billing: 'Auto Debit',
      status: 'Pending'
    },
    {
      id: 8,
      name: 'Saunder Offner',
      email: 'soffner19@mac.com',
      avatar: 'SO',
      role: 'Maintainer',
      roleIcon: '👤',
      plan: 'Enterprise',
      billing: 'Auto Debit',
      status: 'Pending'
    },
    {
      id: 9,
      name: 'Stephen MacGilfoyle',
      email: 'smacgilfoyle@bigcartel.com',
      avatar: 'SM',
      role: 'Maintainer',
      roleIcon: '👤',
      plan: 'Company',
      billing: 'Manual - Paypal',
      status: 'Pending'
    },
    {
      id: 10,
      name: 'Skip Hebblethwaite',
      email: 'shebblethwaite@arizona.edu',
      avatar: 'SH',
      role: 'Admin',
      roleIcon: '🛡️',
      plan: 'Company',
      billing: 'Manual - Cash',
      status: 'Inactive'
    }
  ];

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesPlan = !planFilter || user.plan === planFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesPlan && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, planFilter, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const roles = [...new Set(users.map(user => user.role))];
  const plans = [...new Set(users.map(user => user.plan))];
  const statuses = [...new Set(users.map(user => user.status))];

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Pending: 'bg-yellow-100 text-yellow-800'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search Filters */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Search Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Plan Filter */}
          <div className="relative">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Select Plan</option>
              {plans.map(plan => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Select Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Items per page and search/actions */}
        <div className="flex flex-col flex-wrap sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search User"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USER</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROLE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLAN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BILLING</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white text-sm font-medium mr-3`}>
                      {user.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">{user.roleIcon}</span>
                    <span className="text-sm text-gray-900">{user.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.plan}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.billing}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementTable;