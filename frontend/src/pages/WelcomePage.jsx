import React from 'react';
import { Link } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';

const WelcomePage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#111111] text-white px-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to MyApp</h1>

                <p className="text-lg text-gray-300 mb-6 min-h-[2rem]">
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

                <div className="flex justify-center space-x-4">
                    <Link
                        to="/auth?mode=login"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition duration-200"
                    >
                        Login
                    </Link>
                    <Link
                        to="/auth?mode=register"
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
