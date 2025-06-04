import React from 'react';

const LoadingPage = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center z-50">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-blue-600">TABB Railway Corporation ®</h1>
            </div>

            <div className="flex flex-col items-center">
                {/* Better loading spinner */}
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                </div>
                <p className="text-gray-700 mt-4 text-center max-w-md px-4">{message}</p>
            </div>
        </div>
    );
};

export default LoadingPage;