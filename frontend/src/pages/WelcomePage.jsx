import React from 'react';
import { Link } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';

const WelcomePage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#111111] text-white px-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center space-y-6">

                {/* Title */}
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
                    Vortex
                </h1>

                {/* Subtitle */}
                <p className="text-sm text-gray-400">Next-Gen Development Platform</p>

                {/* Typewriter Text */}
                <p className="text-lg text-gray-300 min-h-[2.5rem]">
                    <Typewriter
                        words={[
                            'A platform for all your needs.',
                            'Deploy. Build. Scale.',
                            'Developer friendly. Lightning fast.',
                        ]}
                        loop={0}
                        cursor
                        cursorStyle="|"
                        typeSpeed={60}
                        deleteSpeed={40}
                        delaySpeed={1500}
                    />
                </p>

                {/* Buttons */}
                <div className="flex justify-center space-x-4">
                    <Link
                        to="/auth?mode=login"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-transform transform hover:scale-105 shadow-md"
                    >
                        Login
                    </Link>
                    <Link
                        to="/auth?mode=register"
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-transform transform hover:scale-105 shadow-md"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
