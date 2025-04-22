import React from 'react';
import { FiGitCommit, FiMessageCircle, FiFolderPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

const activities = [
    {
        icon: <FiGitCommit size={20} className="text-gray-400" />,
        title: 'Updated Project',
        description: 'Your "awesome-project" was updated last week.'
    },
    {
        icon: <FiMessageCircle size={20} className="text-gray-400" />,
        title: 'New Comment',
        description: 'You received a new comment on your "portfolio-site".'
    },
    {
        icon: <FiFolderPlus size={20} className="text-gray-400" />,
        title: 'New Repository',
        description: 'A new repo "chat-app" was created.'
    }
];

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-6 py-10">
            <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-lg text-gray-400 text-center max-w-xl">
                Welcome back! Here's a quick overview of your recent activity and updates.
            </p>

            <div className="mt-10 w-full max-w-md bg-[#111111] border border-gray-700 rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
                <ul className="space-y-4">
                    {activities.map((activity, idx) => (
                        <motion.li
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                            className="bg-[#1c1c1c] p-4 rounded-lg hover:bg-[#292929] transition-all duration-200 flex items-start gap-3"
                        >
                            {activity.icon}
                            <div>
                                <span className="block font-medium">{activity.title}</span>
                                <span className="text-sm text-gray-400">{activity.description}</span>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
