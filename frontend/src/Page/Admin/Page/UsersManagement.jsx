// import React, { useState, useEffect } from 'react';
// import {
//   Users, User, Shield, Activity,
//   UserCheck, Clock8,
//   RefreshCw
// } from 'lucide-react';
// import userService from '../../../data/Service/userService';
// import { useLoadingWithTimeout } from '../../../hooks/useLoadingWithTimeout';
// import { useAsyncData } from '../../../hooks/useAsyncData';
// import LoadingPage from '../../../components/LoadingPage';

// const UsersManagement = ({ setActiveTab }) => {
//   const [userData, setUserData] = useState({
//     totalUsers: 0,
//     customerAccounts: 0,
//     adminAccounts: 0,
//     verifiedUsers: 0,
//     pendingUsers: 0,
//     newUsersThisWeek: 0
//   });

//   // Use useAsyncData for initial data fetching
//   const {
//     data: users,
//     loading: dataLoading,
//     error: dataError,
//     refetch: refetchUsers,
//     setData: setUsers
//   } = useAsyncData(() => userService.getAllUsers());

//   // Use useLoadingWithTimeout for operations
//   const {
//     loading: operationLoading,
//     error: operationError,
//     setError: setOperationError,
//     startLoading,
//     stopLoading,
//     setLoadingError
//   } = useLoadingWithTimeout();

//   // Process user data when it changes - MOVED BEFORE EARLY RETURN
//   useEffect(() => {
//     if (users && users.length > 0) {
//       processUserData(users);
//     }
//   }, [users]);

//   // Show loading page during initial data fetch
//   if (dataLoading) {
//     return <LoadingPage message="Loading user management..." />;
//   }

//   const processUserData = (usersData) => {
//     // Extract counts and statistics from the user data
//     const total = usersData.length;
//     const admins = usersData.filter(user => user.Role === 'Admin').length;
//     const customers = usersData.filter(user => user.Role === 'Customer').length;

//     // Match the database status values: "verified" and "pending"
//     const verified = usersData.filter(user => user.Status === 'verified').length;
//     const pending = usersData.filter(user => user.Status === 'pending').length;

//     // Calculate new users this week (this is mock data - you'd need actual date filtering)
//     const newThisWeek = Math.floor(total * 0.1); // Mock: 10% of users are "new"

//     setUserData({
//       totalUsers: total,
//       customerAccounts: customers,
//       adminAccounts: admins,
//       verifiedUsers: verified,
//       pendingUsers: pending,
//       newUsersThisWeek: newThisWeek
//     });
//   };

//   const calculatePercentage = (value, total) => {
//     if (total === 0) return 0;
//     return Math.round((value / total) * 100);
//   };

//   const calculateStatusPercentages = () => {
//     const total = userData.verifiedUsers + userData.pendingUsers;
//     if (total === 0) return { verified: 0, pending: 0 };

//     let verified = Math.floor((userData.verifiedUsers / total) * 100);
//     let pending = 100 - verified;

//     return { verified, pending };
//   };

//   const statusPercentages = calculateStatusPercentages();

//   // Combine error states
//   const currentError = dataError || operationError;

//   const handleRefresh = async () => {
//     try {
//       startLoading();
//       await refetchUsers();
//       stopLoading();
//     } catch (error) {
//       setLoadingError('Failed to refresh user data: ' + error.toString());
//     }
//   };

//   return (
//     <div className="flex-1 flex flex-col p-6 bg-gray-50 user-management relative">
//       {/* Only show operation loading overlay */}
//       {operationLoading && (
//         <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
//           <div className="flex flex-col items-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//             <p className="mt-2 text-sm text-gray-600">Processing...</p>
//           </div>
//         </div>
//       )}

//       <div className="flex items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
//         <button
//           onClick={handleRefresh}
//           disabled={operationLoading}
//           className="ml-auto flex items-center px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           title="Reload data"
//         >
//           <RefreshCw className={`h-5 w-5 text-gray-600 mr-2 ${operationLoading ? 'animate-spin' : ''}`} />
//           <span className="text-gray-600 font-medium">{operationLoading ? 'Refreshing...' : 'Reload'}</span>
//         </button>
//       </div>

//       {/* Error message */}
//       {currentError && (
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="font-medium">
//                 {dataError ? 'Data Loading Error' : 'Operation Error'}
//               </p>
//               <p className="mt-1">{currentError}</p>
//             </div>
//             <button
//               onClick={() => {
//                 setOperationError(null);
//                 if (dataError) refetchUsers();
//               }}
//               className="text-red-500 hover:text-red-700 font-bold text-lg"
//               title="Dismiss error"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Data status info */}
//       <div className="mb-4 text-sm text-gray-600">
//         <p>
//           <strong>Total Users:</strong> {users?.length || 0} |
//           <strong> Admins:</strong> {userData.adminAccounts} |
//           <strong> Customers:</strong> {userData.customerAccounts} |
//           <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
//         </p>
//       </div>

//       {/* User Overview Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Users</p>
//               <p className="text-2xl font-bold text-gray-900">{userData.totalUsers}</p>
//             </div>
//             <div className="bg-blue-100 p-2 rounded-full">
//               <Users className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Customer Accounts</p>
//               <p className="text-2xl font-bold text-gray-900">{userData.customerAccounts}</p>
//             </div>
//             <div className="bg-green-100 p-2 rounded-full">
//               <User className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Admin Accounts</p>
//               <p className="text-2xl font-bold text-gray-900">{userData.adminAccounts}</p>
//             </div>
//             <div className="bg-purple-100 p-2 rounded-full">
//               <Shield className="h-6 w-6 text-purple-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Active Sessions</p>
//               <p className="text-2xl font-bold text-gray-900">42</p>
//             </div>
//             <div className="bg-amber-100 p-2 rounded-full">
//               <Activity className="h-6 w-6 text-amber-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* User Status and Insights Panels */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* User Status Distribution - modified for only verified and pending */}
//         <div className="col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-700 mb-6">User Status Distribution</h2>

//           {/* Combined status bar - now only verified and pending */}
//           <div className="h-8 bg-gray-100 rounded-md overflow-hidden flex mb-6">
//             <div
//               className="bg-green-500 text-white flex items-center justify-center"
//               style={{ width: `${statusPercentages.verified}%` }}
//             >
//               {statusPercentages.verified > 10 && `${statusPercentages.verified}%`}
//             </div>
//             <div
//               className="bg-yellow-500 text-white flex items-center justify-center"
//               style={{ width: `${statusPercentages.pending}%` }}
//             >
//               {statusPercentages.pending > 10 && `${statusPercentages.pending}%`}
//             </div>
//           </div>

//           <div className="flex justify-around">
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
//               <span className="text-sm text-gray-600">Verified</span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
//               <span className="text-sm text-gray-600">Pending</span>
//             </div>
//           </div>
//         </div>

//         {/* User Insights */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-700 mb-6">User Insights</h2>

//           <div className="space-y-6">
//             <div className="flex items-center">
//               <div className="bg-blue-100 p-2 rounded-full mr-4">
//                 <Shield className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="font-medium">
//                   {calculatePercentage(userData.adminAccounts, userData.totalUsers)}% admin ratio
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center">
//               <div className="bg-green-100 p-2 rounded-full mr-4">
//                 <UserCheck className="h-5 w-5 text-green-600" />
//               </div>
//               <div>
//                 <p className="font-medium">{userData.verifiedUsers} verified users</p>
//               </div>
//             </div>

//             <div className="flex items-center">
//               <div className="bg-amber-100 p-2 rounded-full mr-4">
//                 <Clock8 className="h-5 w-5 text-amber-600" />
//               </div>
//               <div>
//                 <p className="font-medium">{userData.newUsersThisWeek} new users this week</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UsersManagement;