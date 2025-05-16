import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const AccountSettings = () => {
    const { user } = useSelector((state) => state.user);
    const username = user?.username;

    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        email: '',
        password: '',
        githubProfile: '',
    });

    const [initialData, setInitialData] = useState({});
    const [createdAt, setCreatedAt] = useState('');
    const [updatedAt, setUpdatedAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!username) return;

            try {
                const res = await axios.get(`http://localhost:5000/api/user/getuser/${username}`);
                const data = res.data;

                const newForm = {
                    fullname: data.fullname || '',
                    username: data.username || '',
                    email: data.email || '',
                    password: '',
                    githubProfile: data.githubProfile || '',
                };

                setFormData(newForm);
                setInitialData({ ...newForm, password: '' });
                setCreatedAt(data.createdAt);
                setUpdatedAt(data.updatedAt);
            } catch (err) {
                console.error("Failed to fetch user details", err);
                setMessage({ text: 'Failed to load user data', type: 'error' });
            }
        };

        fetchUserDetails();
    }, [username]);

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const hasChanges = () => {
        const { password, ...current } = formData;
        const { password: _, ...initial } = initialData;
        return JSON.stringify(current) !== JSON.stringify(initial) || password.trim().length > 0;
    };

    const handleSave = async () => {
        if (!hasChanges()) {
            setMessage({ text: 'No changes to save', type: 'info' });
            return;
        }

        try {
            setLoading(true);
            const { fullname, email, password } = formData;

            const res = await axios.put(
                `http://localhost:5000/api/user/updateuser/${username}`,
                { fullname, email, password }
            );

            setMessage({ text: 'Changes saved successfully!', type: 'success' });
            setUpdatedAt(res.data.user.updatedAt);
            setInitialData({ ...formData, password: '' });
            setFormData((prev) => ({ ...prev, password: '' }));
        } catch (err) {
            console.error("Update error:", err);
            setMessage({
                text: err.response?.data?.message || 'Failed to save changes',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const getMessageStyle = () => {
        switch (message.type) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'info': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-[90vh] bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#111] border border-gray-800 rounded-2xl shadow-xl p-6 relative pb-24">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                    <p className="text-gray-400 text-sm">Manage your account information</p>
                </div>

                <div className="space-y-6 mb-8">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleInputChange}
                            placeholder="Enter full name"
                            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg
                                       text-sm text-white placeholder-gray-500
                                       focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                        />
                    </div>

                    {/* Username (disabled) */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            disabled
                            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg
                                       text-sm text-gray-400 placeholder-gray-500 cursor-not-allowed"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Email</label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email"
                            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg
                                       text-sm text-white placeholder-gray-500
                                       focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                        />
                    </div>

                    {/* GitHub Profile (disabled) */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">GitHub Username</label>
                        <input
                            type="text"
                            name="githubProfile"
                            value={formData.githubProfile}
                            disabled
                            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg
                                       text-sm text-gray-400 placeholder-gray-500 cursor-not-allowed"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter new password"
                                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg
                                           text-sm text-white placeholder-gray-500
                                           focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            />
                            <button
                                onClick={handleTogglePassword}
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mb-6">
                    <button
                        onClick={handleSave}
                        disabled={loading || !hasChanges()}
                        className={`w-full py-3 rounded-lg font-medium text-sm transition-all
                                    ${loading || !hasChanges()
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-white/90 text-black hover:bg-white'}`}
                    >
                        {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`text-center text-sm ${getMessageStyle()} animate-fadeIn`}>
                        {message.text}
                    </div>
                )}

                {/* Timestamps */}
                <div className="absolute bottom-4 left-8 right-8 flex justify-between text-xs text-gray-500">
                    {createdAt && <p>Created: {moment(createdAt).format('MMM D, YYYY h:mm A')}</p>}
                    {updatedAt && <p>Updated: {moment(updatedAt).format('MMM D, YYYY h:mm A')}</p>}
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
