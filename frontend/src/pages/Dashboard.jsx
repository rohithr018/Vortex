import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [deployments, setDeployments] = useState([]);
    const { user } = useSelector((state) => state.user);
    const username = user?.githubProfile;

    useEffect(() => {
        const fetchDeployments = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/deploy/getdeploy?user=${username}`);
                setDeployments(res.data);
            } catch (err) {
                console.error("Failed to fetch deployments", err);
            }
        };

        if (username) fetchDeployments();
    }, [username]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center px-6 py-10">
            <h1 className="text-4xl font-bold mb-6">Deployments Dashboard</h1>

            <div className="w-full max-w-7xl bg-[#121212] rounded-2xl shadow-2xl border border-gray-800 p-8 h-[600px] flex flex-col">
                <h2 className="text-2xl font-semibold mb-4 text-white">Your Deployments</h2>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deployments.length > 0 ? (
                            deployments.map((deploy, idx) => (
                                <motion.div
                                    key={deploy.deploymentId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                                    className="bg-[#1c1c1c] p-5 rounded-xl border border-gray-700 shadow-lg hover:bg-[#292929] transition-all"
                                >
                                    <div className="space-y-2">
                                        <div className="text-xl font-semibold text-white">
                                            {deploy.repoName}
                                        </div>

                                        <div className="text-sm text-gray-400"><span className="font-medium text-white">Deployed ID:</span>{' '}
                                            {deploy.deploymentId.length > 35
                                                ? `${deploy.deploymentId.slice(0, 35)}...`
                                                : deploy.deploymentId}
                                        </div>

                                        <div className="text-sm text-gray-400">
                                            <span className="font-medium text-white">Branch:</span> {deploy.branch}
                                        </div>

                                        <div className="text-sm text-gray-400">
                                            <span className="font-medium text-white">Created At:</span> {new Date(deploy.createdAt).toLocaleString()}
                                        </div>

                                        <div className="pt-3">
                                            <a
                                                href={deploy.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                                            >
                                                View Deployment
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-400 mt-4">No deployments found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
