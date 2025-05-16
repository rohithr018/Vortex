import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-[#0d0d0d] px-6 py-4 shadow-lg relative z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
                <p>&copy; {new Date().getFullYear()}. VORTEX. All rights reserved.</p>
                <div className="space-x-4">
                    <a href="#" className="hover:text-gray-300">Privacy</a>
                    <a href="#" className="hover:text-gray-300">Terms</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
