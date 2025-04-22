import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const FallBack = () => {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-4">
            <FiAlertTriangle className="text-yellow-500 text-6xl mb-4" />
            <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
            <p className="text-gray-400 text-lg mb-6 text-center">
                Oops! The page you're looking for doesn't exist.
            </p>
            <Link
                to="/"
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-medium transition"
            >
                Go Home
            </Link>
        </div>
    );
};

export default FallBack;
