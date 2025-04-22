import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaSearch, FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
    const [searchText, setSearchText] = useState("");
    const [customRepoUrl, setCustomRepoUrl] = useState("");
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [profileError, setProfileError] = useState("");

    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const username = user?.githubProfile;

    useEffect(() => {
        const fetchRepos = async () => {
            if (!username) return;
            setLoading(true);
            setError("");
            try {
                const response = await axios.post("http://localhost:5000/api/github/repos", { githubProfile: username });
                setRepositories(response.data);
            } catch (error) {
                console.error("Error fetching repositories:", error);
                setError("Failed to load repositories. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, [username]);

    const filteredRepos = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleImportRepo = (repoName) => {
        // Navigate to /deploy/username/repo
        navigate(`/deploy/${username}/${repoName}`);
    };

    const handleImportCustomRepo = async () => {
        const gitHubUrlRegex = /^https:\/\/github\.com\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_.-]+)(\/)?$/;

        setError("");
        setProfileError("");

        if (!customRepoUrl.trim()) {
            setError("Repository URL cannot be empty");
            return;
        }

        const match = customRepoUrl.trim().match(gitHubUrlRegex);
        if (!match) {
            setError("Invalid GitHub URL. Expected format: https://github.com/username/repo-name");
            return;
        }

        const [, owner, repo] = match;

        try {
            const response = await axios.get(`https://api.github.com/users/${owner}`);
            if (response.status === 200) {
                // Navigate to /deploy/username/repo with extracted username and repo
                navigate(`/deploy/${owner}/${repo}`);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setProfileError("GitHub profile not found.");
            } else {
                setProfileError("Error checking GitHub profile.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] p-6 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-[#111111] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
                <div className="p-10 text-white flex flex-col gap-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-2">New Deployment</h2>
                        <p className="text-sm text-gray-400">Select a repository to import</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex items-center gap-2">
                            <FaGithub size={24} className="text-gray-400" />
                            <span className="font-semibold text-2xl text-white">{username}</span>
                        </div>

                        <div className="relative w-full lg:w-1/2">
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full px-10 py-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4">
                        <div className="h-[300px] overflow-y-auto pr-1">
                            {loading ? (
                                <div className="flex justify-center items-center h-full text-sm text-gray-500">Loading repositories...</div>
                            ) : filteredRepos.length > 0 ? (
                                <div className="divide-y divide-gray-700">
                                    {filteredRepos.map((repo) => (
                                        <div
                                            key={repo.id}
                                            className="flex justify-between items-center px-2 py-3 hover:bg-[#222] transition"
                                        >
                                            <div className="text-white font-medium text-sm truncate">{repo.name}</div>
                                            <button
                                                onClick={() => handleImportRepo(repo.name)}
                                                className="bg-white text-black font-medium px-3 py-1.5 text-sm rounded-md hover:bg-gray-400 transition"
                                            >
                                                Import
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex justify-center items-center h-full text-sm text-gray-500">No match found</div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 my-2">
                        <hr className="flex-grow border-gray-700" />
                        <span className="text-gray-500 text-sm font-semibold">OR</span>
                        <hr className="flex-grow border-gray-700" />
                    </div>

                    <div className="space-y-2">
                        <span className="text-white font-semibold">Deploy from GitHub URL</span>
                        <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    placeholder="https://github.com/username/repo-name"
                                    value={customRepoUrl}
                                    onChange={(e) => setCustomRepoUrl(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-md bg-[#111111] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                                />
                                <button
                                    onClick={handleImportCustomRepo}
                                    className="bg-white text-black font-medium px-3 py-1.5 text-sm rounded-md hover:bg-gray-400 transition"
                                >
                                    Import
                                </button>
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {profileError && <p className="text-red-500 text-sm">{profileError}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
