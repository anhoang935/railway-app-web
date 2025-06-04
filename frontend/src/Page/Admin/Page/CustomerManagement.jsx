import React, { useState, useEffect } from 'react';
import {
  UserPlus, Search, Edit, Trash2,
  CheckCircle, XCircle, RefreshCw, Filter, Download, UserCheck
} from 'lucide-react';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import userService from '../../../data/Service/userService';
import { useLoadingWithTimeout } from '../../../hooks/useLoadingWithTimeout';
import { useAsyncData } from '../../../hooks/useAsyncData';
import LoadingPage from '../../../components/LoadingPage';

const StaffUsers = ({ setActiveTab }) => {
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  // Use useAsyncData for initial data fetching
  const {
    data: allUsers,
    loading: dataLoading,
    error: dataError,
    refetch: refetchUsers,
    setData: setAllUsers
  } = useAsyncData(() => userService.getAllUsers());

  // Use useLoadingWithTimeout for operations
  const {
    loading: operationLoading,
    error: operationError,
    setError: setOperationError,
    startLoading,
    stopLoading,
    setLoadingError
  } = useLoadingWithTimeout();

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Show loading page during initial data fetch
  if (dataLoading) {
    return <LoadingPage message="Loading customers..." />;
  }

  // Filter for Customer role only
  const customers = allUsers ? allUsers.filter(user => user.Role === 'Customer') : [];

  // Combine error states
  const currentError = dataError || operationError;

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add new customer handlers
  const handleAddNew = () => {
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
    setIsAdding(true);
    setEditingId(null);
    setOperationError(null);
  };

  const handleEdit = (user) => {
    setFormData({
      UserName: user.UserName || '',
      Email: user.Email || '',
      Gender: user.Gender || '',
      PhoneNumber: user.PhoneNumber || '',
      DateOfBirth: user.DateOfBirth ? user.DateOfBirth.substring(0, 10) : '',
      Address: user.Address || '',
      Status: user.Status || 'pending',
      Role: user.Role || 'Customer',
      Password: ''
    });
    setEditingId(user.userID);
    setIsAdding(false);
    setOperationError(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setOperationError(null);
  };

  // Save new customer
  const handleSaveNew = async () => {
    try {
      startLoading();

      const newUser = await userService.createUser({
        ...formData,
        Role: formData.Role
      });

      // Optimistic update
      if (newUser) {
        setAllUsers(prevUsers => [...prevUsers, newUser]);
      } else {
        await refetchUsers();
      }

      setSuccessMessage("Customer created successfully");
      setIsAdding(false);
      stopLoading();
    } catch (err) {
      setLoadingError(`Failed to create customer: ${err.toString()}`);
    }
  };

  // Save edited customer
  const handleSaveEdit = async () => {
    try {
      startLoading();

      const updateData = {
        ...formData,
        Role: formData.Role
      };
      if (!updateData.Password) delete updateData.Password;

      await userService.updateUser(editingId, updateData);

      // Optimistic update
      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user.userID === editingId
            ? { ...user, ...updateData }
            : user
        )
      );

      setSuccessMessage(`Customer updated successfully`);
      setEditingId(null);
      stopLoading();
    } catch (err) {
      setLoadingError(`Failed to update customer: ${err.toString()}`);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      try {
        startLoading();

        await userService.deleteUser(userId);

        // Optimistic update
        setAllUsers(prevUsers => prevUsers.filter(user => user.userID !== userId));

        setSuccessMessage("Customer deleted successfully");
        stopLoading();
      } catch (err) {
        setLoadingError(`Failed to delete customer: ${err.toString()}`);
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvRows = [];
    const headers = ['ID', 'Username', 'Email', 'Phone', 'Gender', 'Date of Birth', 'Address', 'Status', 'Role'];
    csvRows.push(headers.join(','));

    filteredUsers.forEach(user => {
      const values = [
        user.userID,
        user.UserName || '',
        user.Email || '',
        user.PhoneNumber || '',
        user.Gender || '',
        user.DateOfBirth ? user.DateOfBirth.substring(0, 10) : '',
        (user.Address || '').replace(/,/g, ' '),
        user.Status || '',
        user.Role || ''
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col min-h-[800px] customer-management relative">
      {/* Only show operation loading overlay */}
      {operationLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-600">Processing...</p>
          </div>
        </div>
      )}

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
            onClick={refetchUsers}
            disabled={operationLoading || isAdding || editingId !== null}
            className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh"
          >
            <RefreshCw size={16} className={operationLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={exportToCSV}
            disabled={operationLoading || isAdding || editingId !== null}
            className="flex items-center px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to CSV"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>

          <button
            onClick={handleAddNew}
            disabled={operationLoading || isAdding || editingId !== null}
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={16} className="mr-2" />
            Add a Customer
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
      {currentError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">
                {dataError ? 'Data Loading Error' : 'Operation Error'}
              </p>
              <p className="mt-1">{currentError}</p>
            </div>
            <button
              onClick={() => {
                setOperationError(null);
                if (dataError) refetchUsers();
              }}
              className="text-red-500 hover:text-red-700 font-bold text-lg"
              title="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Data status info */}
      <div className="mb-4 text-sm text-gray-600">
        <p>
          <strong>Customers:</strong> {customers.length} |
          <strong> Filtered:</strong> {filteredUsers.length} |
          <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
        </p>
      </div>

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
            {/* Add New Row Form - Appears inline at top of table */}
            {isAdding && (
              <>
                <tr className="bg-blue-50 sticky top-[41px] z-10">
                  <td className="px-4 py-2 border-b border-gray-200">
                    <span className="text-gray-500 italic">Auto-generated</span>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      name="UserName"
                      value={formData.UserName}
                      onChange={handleInputChange}
                      disabled={operationLoading}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                      placeholder="Username"
                      required
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <input
                      type="email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleInputChange}
                      disabled={operationLoading}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                      placeholder="Email"
                      required
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      name="PhoneNumber"
                      value={formData.PhoneNumber}
                      onChange={handleInputChange}
                      disabled={operationLoading}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                      placeholder="Phone Number"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <select
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleInputChange}
                      disabled={operationLoading}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <select
                      name="Status"
                      value={formData.Status}
                      onChange={handleInputChange}
                      disabled={operationLoading}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={handleSaveNew}
                        disabled={operationLoading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                      >
                        <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={operationLoading}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                      >
                        <FaTimes className="mr-1" /> Cancel
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Additional form fields row */}
                <tr className="bg-blue-50 sticky top-[82px] z-10">
                  <td colSpan="7" className="px-4 py-2 border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                          type="password"
                          name="Password"
                          value={formData.Password}
                          onChange={handleInputChange}
                          disabled={operationLoading}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                          placeholder="Password"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          name="DateOfBirth"
                          value={formData.DateOfBirth}
                          onChange={handleInputChange}
                          disabled={operationLoading}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          name="Role"
                          value={formData.Role}
                          onChange={handleInputChange}
                          disabled={operationLoading}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                        >
                          <option value="Customer">Customer</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          name="Address"
                          value={formData.Address}
                          onChange={handleInputChange}
                          disabled={operationLoading}
                          rows={2}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                          placeholder="Address"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </>
            )}
            {/* Edit Row Form - Similar to Add New but appears in place of the row being edited */}
            {editingId !== null && (
              <>
                <tr className="bg-blue-50 sticky top-[41px] z-10">
                  <td className="px-4 py-2 border-b border-gray-200">
                    {editingId}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      name="UserName"
                      value={formData.UserName}
                      onChange={handleInputChange}
                      disabled={operationLoading}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                      placeholder="Username"
                      required
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <input
                      type="email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleInputChange}
                      disabled={operationLoading}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                      placeholder="Email"
                      required
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      name="PhoneNumber"
                      value={formData.PhoneNumber}
                      onChange={handleInputChange}
                      disabled={operationLoading}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                      placeholder="Phone Number"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <select
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleInputChange}
                      disabled={operationLoading}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <select
                      name="Status"
                      value={formData.Status}
                      onChange={handleInputChange}
                      disabled={operationLoading}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={operationLoading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                      >
                        <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={operationLoading}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                      >
                        <FaTimes className="mr-1" /> Cancel
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Additional form fields for editing */}
                <tr className="bg-blue-50 sticky top-[82px] z-10">
                  <td colSpan="7" className="px-4 py-2 border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep unchanged)</label>
                        <input
                          type="password"
                          name="Password"
                          value={formData.Password}
                          onChange={handleInputChange}
                          disabled={operationLoading}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                          placeholder="New Password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          name="DateOfBirth"
                          value={formData.DateOfBirth}
                          onChange={handleInputChange}
                          disabled={operationLoading}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          name="Role"
                          value={formData.Role}
                          onChange={handleInputChange}
                          disabled={operationLoading}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                        >
                          <option value="Customer">Customer</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          name="Address"
                          value={formData.Address}
                          onChange={handleInputChange}
                          disabled={operationLoading}
                          rows={2}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                          placeholder="Address"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </>
            )}
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.Status === 'verified'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {user.Status || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        disabled={operationLoading || isAdding || editingId !== null}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.userID)}
                        disabled={operationLoading || isAdding || editingId !== null}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="flex-grow"></div>

      {/* Pagination - at the bottom of the page with more spacing */}
      <div className="mt-8 border-t pt-6 bg-gray-50 -mx-6 px-6 pb-6 rounded-b-lg">
        {sortedUsers.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, sortedUsers.length)} of {sortedUsers.length} customers
            </p>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || operationLoading}
                className={`px-3 py-1 rounded-md ${currentPage === 1 || operationLoading
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
                  disabled={operationLoading}
                  className={`px-3 py-1 rounded-md ${currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : operationLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || operationLoading}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages || operationLoading
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