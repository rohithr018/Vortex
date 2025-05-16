import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/user/UserSlice';
import { FiUser } from 'react-icons/fi';

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const { user } = useSelector((state) => state.user);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    console.log(user)
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-[#0d0d0d] px-6 py-4 relative z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link
                    to="/"
                    className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
                >
                    VORTEX
                </Link>

                <div className="flex items-center space-x-6 text-gray-300">


                    {/* Profile Button */}
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            ref={buttonRef}
                            className="text-white rounded-full flex items-center justify-center w-12 h-12 hover:scale-110 transition-transform duration-300 ease-in-out"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105">
                                <FiUser className="text-white text-2xl" />
                            </div>

                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div
                                ref={dropdownRef}
                                className="absolute right-0 mt-2 w-56 bg-black border border-gray-800 rounded-lg shadow-lg"
                            >
                                <div className="flex flex-col text-white p-4">
                                    <div className="border-b border-gray-700 pb-2 text-center">
                                        <span className="text-lg font-semibold block">{user.fullname}</span>
                                        <span className="text-xs text-gray-400 block">{user.email}</span>
                                    </div>

                                    <Link to="/dashboard" className="mt-4 text-sm text-gray-400 hover:text-white text-center">
                                        Deployments
                                    </Link>

                                    <Link to="/account-settings" className="mt-2 text-sm text-gray-400 hover:text-white text-center">
                                        Account Settings
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="mt-4 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm transition duration-200 ease-in-out"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
