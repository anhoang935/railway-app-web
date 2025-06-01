import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Search, Edit, Trash2,
  CheckCircle, XCircle, RefreshCw, Filter, Download, UserCheck
} from 'lucide-react';
// If you need these icons for the edit/delete buttons like in TrainManagement
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import userService from '../../../data/Service/userService';

const StaffUsers = ({ setActiveTab }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    UserName: '',
    Email: '',
    Password: '',
    Gender: '',
    PhoneNumber: '',
    DateOfBirth: '',
    Address: '',
    Status: 'pending',
    Role: 'Customer'
  });
  
  // Filter and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Fetch all users (only customers)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      // Filter for Customer role only
      const customerUsers = allUsers.filter(user => user.Role === 'Customer');
      setCustomers(customerUsers);
      setError(null);
    } catch (err) {
      setError(`Error loading users: ${err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Modal handlers
  const openCreateModal = () => {
    setFormData({
      UserName: '',
      Email: '',
      Password: '',
      Gender: '',
      PhoneNumber: '',
      DateOfBirth: '',
      Address: '',
      Status: 'pending',
      Role: 'Customer'
    });
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    // Don't include password when editing
    setFormData({
      UserName: user.UserName || '',
      Email: user.Email || '',
      Gender: user.Gender || '',
      PhoneNumber: user.PhoneNumber || '',
      DateOfBirth: user.DateOfBirth ? user.DateOfBirth.substring(0, 10) : '', // Format date
      Address: user.Address || '',
      Status: user.Status || 'pending',
      Role: user.Role || 'Customer', // Use the user's actual role
      // Password is empty for editing
      Password: ''
    });
    setCurrentUser(user);
    setModalMode('edit');
    setShowModal(true);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        await userService.createUser(formData);
        setSuccessMessage("User created successfully");
      } else if (modalMode === 'edit') {
        // Only send non-empty fields for update
        const updateData = { ...formData };
        if (!updateData.Password) delete updateData.Password;
        
        // Check if role is changing from Customer to Admin
        const isChangingToAdmin = currentUser.Role === 'Customer' && formData.Role === 'Admin';
        
        await userService.updateUser(currentUser.userID, updateData);
        
        if (isChangingToAdmin) {
          // If changing to Admin, show special message and redirect
          setShowModal(false);
          setSuccessMessage("User role changed to Admin. Redirecting to Admin management...");
          
          // Redirect after a short delay
          setTimeout(() => {
            setActiveTab("staff-members"); // This requires passing setActiveTab as a prop to StaffUsers component
          }, 1500);
          
          return;
        }
        
        setSuccessMessage("User updated successfully");
      }
      
      setShowModal(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(`Operation failed: ${err.toString()}`);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await userService.deleteUser(userId);
        setSuccessMessage("User deleted successfully");
        fetchUsers();
      } catch (err) {
        setError(`Failed to delete user: ${err.toString()}`);
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvRows = [];
    // Add header row
    const headers = ['ID', 'Username', 'Email', 'Phone', 'Gender', 'Date of Birth', 'Address', 'Status', 'Role'];
    csvRows.push(headers.join(','));
    
    // Add data rows
    filteredUsers.forEach(user => {
      const values = [
        user.userID,
        user.UserName || '',
        user.Email || '',
        user.PhoneNumber || '',
        user.Gender || '',
        user.DateOfBirth ? user.DateOfBirth.substring(0, 10) : '',
        (user.Address || '').replace(/,/g, ' '), // Replace commas to avoid CSV issues
        user.Status || '',
        user.Role || ''
      ];
      csvRows.push(values.join(','));
    });
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Apply filters
  const filteredUsers = customers.filter(user => {
    const matchesSearch = 
      user.UserName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.PhoneNumber?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || user.Status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort users by ID in ascending order
  const sortedUsers = [...filteredUsers].sort((a, b) => a.userID - b.userID);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col min-h-[800px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
        
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search size={16} />
            </div>
          </div>
          
          <div className="relative">
            <select
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </select>
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Filter size={16} />
            </div>
          </div>
          
          <button
            onClick={fetchUsers}
            className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            title="Export to CSV"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={16} className="mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 flex justify-between items-center">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="text-green-700">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 flex justify-between items-center">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="text-red-700">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto flex-grow">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Username</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Email</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Phone</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Gender</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                currentUsers.map((user, index) => (
                  <tr key={user.userID} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{user.userID}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.UserName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.Email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.PhoneNumber || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.Gender || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.Status === 'verified'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.Status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center"
                          title="Edit"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.userID)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center"
                          title="Delete"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for create/edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {modalMode === 'create' ? 'Add New Customer' : 'Edit Customer'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="UserName"
                    value={formData.UserName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {modalMode === 'create' ? 'Password' : 'New Password (leave blank to keep unchanged)'}
                  </label>
                  <input
                    type="password"
                    name="Password"
                    value={formData.Password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required={modalMode === 'create'}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="PhoneNumber"
                    value={formData.PhoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="DateOfBirth"
                    value={formData.DateOfBirth}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="Status"
                    value={formData.Status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="Role"
                    value={formData.Role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    name="Address"
                    value={formData.Address}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex-grow"></div>
      
      {/* Pagination - at the bottom of the page with more spacing */}
      <div className="mt-8 border-t pt-6 bg-gray-50 -mx-6 px-6 pb-6 rounded-b-lg">
        {!loading && sortedUsers.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, sortedUsers.length)} of {sortedUsers.length} customers
            </p>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffUsers;