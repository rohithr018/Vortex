import React from 'react';

const AccountSettings = () => {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-4 py-10">
            <div className="w-full max-w-2xl bg-[#111111] border border-gray-800 rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-1 text-center">Account Settings</h1>
                <p className="text-sm text-gray-500 text-center mb-8">Manage your personal information and preferences</p>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="displayname" className="block text-sm text-gray-400 mb-1">Display Name</label>
                        <input
                            id="displayname"
                            type="text"
                            value="rohith"
                            readOnly
                            className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 transition"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-400 mb-1">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value="rohith@gmail.com"
                            readOnly
                            className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 transition"
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <button className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-gray-200 transition text-sm">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
