import React from 'react';

const LoadingPage = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-blue-600">TABB Railway Corporation ®</h1>
            </div>

            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
};

export default LoadingPage;