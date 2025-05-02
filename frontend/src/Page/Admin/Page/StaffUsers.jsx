import React from 'react';

const StaffUsers = ({ setActiveTab }) => {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6 max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Staff Users Management</h2>
                <p className="text-gray-600 mb-6">This section is currently under development. Please check back later.</p>
                <button
                    onClick={() => setActiveTab("dashboard")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default StaffUsers;