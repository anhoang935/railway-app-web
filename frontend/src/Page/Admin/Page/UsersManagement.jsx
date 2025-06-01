import React, { useState, useEffect } from 'react';
import { 
  Users, User, Shield, Activity, 
  UserCheck, Clock8, 
  ArrowLeft
} from 'lucide-react';
import userService from '../../../data/Service/userService';

const UsersManagement = ({ setActiveTab }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    totalUsers: 0,
    customerAccounts: 0,
    adminAccounts: 0,
    verifiedUsers: 0,
    pendingUsers: 0,
    newUsersThisWeek: 0
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const users = await userService.getAllUsers();
      processUserData(users);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processUserData = (users) => {
    // Extract counts and statistics from the user data
    const total = users.length;
    const admins = users.filter(user => user.Role === 'Admin').length;
    const customers = users.filter(user => user.Role === 'Customer').length;
    
    // Match the database status values: "verified" and "pending"
    const verified = users.filter(user => user.Status === 'verified').length;
    const pending = users.filter(user => user.Status === 'pending').length;
    
    // Calculate new users in the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsers = users.filter(user => {
      const createdAt = new Date(user.createdAt || user.CreatedAt);
      return createdAt >= oneWeekAgo;
    }).length;

    setUserData({
      totalUsers: total,
      customerAccounts: customers,
      adminAccounts: admins,
      verifiedUsers: verified,
      pendingUsers: pending,
      newUsersThisWeek: newUsers
    });
  };

  // Helper function to calculate percentages
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Calculate percentages for status distribution with only verified and pending
  const calculateStatusPercentages = () => {
    const total = userData.verifiedUsers + userData.pendingUsers;
    if (total === 0) return { verified: 0, pending: 0 };
    
    let verified = Math.floor((userData.verifiedUsers / total) * 100);
    let pending = 100 - verified;
    
    return { verified, pending };
  };

  const statusPercentages = calculateStatusPercentages();

  return (
    <div className="flex-1 flex flex-col p-6 bg-gray-50">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 w-full max-w-md">
            <p>{error}</p>
            <button 
              onClick={fetchUserData} 
              className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Users */}
            <div className="bg-blue-50 p-3 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-gray-600 text-sm mb-0.5">Total Users</h3>
                <p className="text-3xl font-bold text-gray-800">{userData.totalUsers}</p>
                <p className="text-xs text-gray-500">All registered accounts</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            {/* Customer Accounts */}
            <div className="bg-green-50 p-3 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-gray-600 text-sm mb-0.5">Customer Accounts</h3>
                <p className="text-3xl font-bold text-gray-800">{userData.customerAccounts}</p>
                <p className="text-xs text-gray-500">
                  {calculatePercentage(userData.customerAccounts, userData.totalUsers)}% of all users
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>

            {/* Admin Accounts */}
            <div className="bg-purple-50 p-3 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-gray-600 text-sm mb-0.5">Admin Accounts</h3>
                <p className="text-3xl font-bold text-gray-800">{userData.adminAccounts}</p>
                <p className="text-xs text-gray-500">
                  {calculatePercentage(userData.adminAccounts, userData.totalUsers)}% of all users
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* User Status and Insights Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Status Distribution - modified for only verified and pending */}
            <div className="col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-6">User Status Distribution</h2>
              
              {/* Combined status bar - now only verified and pending */}
              <div className="h-8 bg-gray-100 rounded-md overflow-hidden flex mb-6">
                <div 
                  className="bg-green-500 text-white flex items-center justify-center"
                  style={{ width: `${statusPercentages.verified}%` }}
                >
                  {statusPercentages.verified > 10 && `${statusPercentages.verified}%`}
                </div>
                <div 
                  className="bg-yellow-500 text-white flex items-center justify-center"
                  style={{ width: `${statusPercentages.pending}%` }}
                >
                  {statusPercentages.pending > 10 && `${statusPercentages.pending}%`}
                </div>
              </div>

              <div className="flex justify-around">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Verified</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
              </div>
            </div>

            {/* User Insights */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-6">User Insights</h2>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-4">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {calculatePercentage(userData.adminAccounts, userData.totalUsers)}% admin ratio
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-4">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{userData.verifiedUsers} verified users</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-amber-100 p-2 rounded-full mr-4">
                    <Clock8 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">{userData.newUsersThisWeek} new users this week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersManagement;