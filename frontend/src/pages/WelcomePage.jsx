import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-[#111111] text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to MyApp</h1>
                <p className="text-lg mb-6">A platform for all your needs</p>

                <div className="space-x-4">
                    <Link
                        to="/auth"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition duration-200"
                    >
                        Login
                    </Link>

                    <Link
                        to="/auth"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition duration-200"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
