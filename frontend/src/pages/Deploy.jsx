import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit, FiSave, FiTrash, FiGithub, FiGitBranch, FiHome } from 'react-icons/fi';

const Deploy = () => {
    const [selectedBranch, setSelectedBranch] = useState('');
    const [envVars, setEnvVars] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(true);
    const [errorBranches, setErrorBranches] = useState(false);
    const { username, repo } = useParams();
    const envVarContainerRef = useRef(null);
    const logContainerRef = useRef(null);
    const [logs, setLogs] = useState([]);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploymentId, setDeploymentId] = useState(null);
    const abortControllerRef = useRef(null);
    const deployStartTimeRef = useRef(null);
    const [isDeployed, setIsDeployed] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDeploying || isDeployed) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        if (isDeploying || isDeployed) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDeploying, isDeployed]);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/github/branches/${username}/${repo}`);
                const branchList = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data.branches)
                        ? response.data.branches
                        : [];

                if (branchList.length === 0) {
                    setErrorBranches(true);
                } else {
                    setBranches(branchList);
                    setSelectedBranch(branchList[0].name);
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
                setErrorBranches(true);
            } finally {
                setLoadingBranches(false);
            }
        };

        fetchBranches();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [username, repo]);

    useEffect(() => {
        const saveDeploymentData = async () => {
            if (isDeployed && deploymentId) {
                try {
                    const deploymentUrl = `https://deployment-build-artifacts-bucket.s3.us-east-1.amazonaws.com/__outputs/${deploymentId}/index.html`;
                    await axios.post('http://localhost:5000/api/deploy/create', {
                        deploymentId,
                        repoName: repo,
                        branch: selectedBranch,
                        username,
                        logs: logs.map(log => ({
                            message: log.log_message,
                            level: log.log_level,
                            timestamp: log.timestamp
                        })),
                        url: deploymentUrl
                    });
                } catch (error) {
                    console.error('Failed to save deployment data:', error);
                }
            }
        };

        saveDeploymentData();
    }, [isDeployed]);

    const handleAddEnvVar = () => {
        setEnvVars([...envVars, { key: '', value: '', isEditing: true }]);
        scrollToEnvVarBottom();
    };

    const scrollToEnvVarBottom = () => {
        if (envVarContainerRef.current) {
            envVarContainerRef.current.scrollTo({
                top: envVarContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    const scrollToLogBottom = () => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    };

    const handleEnvVarChange = (index, field, value) => {
        const updated = [...envVars];
        updated[index][field] = value;
        setEnvVars(updated);
    };

    const handleEditEnvVar = (index) => {
        const updatedEnvVars = [...envVars];
        updatedEnvVars[index].isEditing = true;
        setEnvVars(updatedEnvVars);
    };

    const handleSaveEnvVar = (index) => {
        const updatedEnvVars = [...envVars];
        updatedEnvVars[index].isEditing = false;
        setEnvVars(updatedEnvVars);
    };

    const handleRemoveEnvVar = (index) => {
        const updatedEnvVars = envVars.filter((_, i) => i !== index);
        setEnvVars(updatedEnvVars);
    };

    const formatElapsedTime = (timestamp) => {
        if (!deployStartTimeRef.current) return '[00:00]';
        const start = new Date(deployStartTimeRef.current);
        const logTime = new Date(timestamp);
        const diffSeconds = Math.floor((logTime - start) / 1000);
        const minutes = Math.floor(diffSeconds / 60).toString().padStart(2, '0');
        const seconds = (diffSeconds % 60).toString().padStart(2, '0');
        return `[${minutes}:${seconds}]`;
    };

    const handleDeploy = async () => {
        const startTime = new Date();
        deployStartTimeRef.current = startTime;
        setIsDeployed(false);
        setIsDeploying(true);
        setLogs([]);

        // Initial log with unique ID
        const initialLog = {
            log_message: 'Starting deployment process...',
            log_level: 'INFO',
            timestamp: startTime.toISOString(),
            elapsedTime: '[00:00]',
            log_uuid: `initial-${Date.now()}`
        };
        setLogs([initialLog]);

        // Unique deployment ID with timestamp
        const deploymentId = `${username}-${repo}-${selectedBranch}`;
        setDeploymentId(deploymentId);
        abortControllerRef.current = new AbortController();

        let isCompleted = false;
        let lastReceivedLogUUID = initialLog.log_uuid;

        try {
            await axios.post('http://localhost:5000/api/deploy/start', {
                repo,
                branch: selectedBranch,
                username,
                deploymentId,
                envVars: envVars
                    .filter(v => v.key && v.value)
                    .map(({ key, value }) => ({ key, value }))
            }, { signal: abortControllerRef.current.signal });

            const pollLogs = async () => {
                if (isCompleted) return;

                try {
                    const response = await axios.get(`http://localhost:5000/api/logs/${deploymentId}`, {
                        signal: abortControllerRef.current.signal,
                        params: {
                            since: lastReceivedLogUUID
                        }
                    });

                    if (response.data && Array.isArray(response.data)) {
                        setLogs(prevLogs => {
                            // Get only new logs we haven't seen before
                            const newLogs = response.data.filter(log =>
                                !prevLogs.some(prevLog => prevLog.log_uuid === log.log_uuid)
                            );

                            if (newLogs.length === 0) {
                                return prevLogs;
                            }

                            // Update last received UUID
                            lastReceivedLogUUID = newLogs[newLogs.length - 1].log_uuid;

                            // Process new logs (add elapsed time)
                            const processedNewLogs = newLogs.map(log => ({
                                ...log,
                                elapsedTime: formatElapsedTime(log.timestamp)
                            }));

                            // Check for deployment completion
                            const deploymentComplete = processedNewLogs.some(
                                log => /Deployment completed successfully/i.test(log.log_message)
                            );

                            if (deploymentComplete) {
                                isCompleted = true;
                                setIsDeployed(true);
                                setIsDeploying(false);
                            }

                            // Combine logs (newest at bottom)
                            const combinedLogs = [...prevLogs, ...processedNewLogs];

                            // Scroll to bottom after state update
                            setTimeout(scrollToLogBottom, 100);
                            return combinedLogs;
                        });
                    }

                    if (!isCompleted) {
                        setTimeout(pollLogs, 500); // Poll every 500ms
                    }
                } catch (error) {
                    if (!axios.isCancel(error)) {
                        console.error('Polling error:', error);
                        setLogs(prev => [
                            ...prev,
                            {
                                log_message: `Log polling failed: ${error.message}`,
                                log_level: 'ERROR',
                                timestamp: new Date().toISOString(),
                                elapsedTime: formatElapsedTime(new Date()),
                                log_uuid: `error-${Date.now()}`
                            }
                        ]);
                        setIsDeploying(false);
                    }
                }
            };

            // Start polling
            pollLogs();

        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error('Deployment error:', error);
                setLogs(prev => [
                    ...prev,
                    {
                        log_message: `Deployment failed: ${error.response?.data?.message || error.message}`,
                        log_level: 'ERROR',
                        timestamp: new Date().toISOString(),
                        elapsedTime: formatElapsedTime(new Date())
                    }
                ]);
                setIsDeploying(false);
            }
        }
    };

    const isAddButtonDisabled = () => {
        const last = envVars[envVars.length - 1];
        return last?.key === '' || last?.value === '' || last?.isEditing;
    };

    const isDeployDisabled = !selectedBranch ||
        envVars.some(v => v.isEditing || !v.key || !v.value) ||
        isDeploying || isDeployed;


    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl w-full">
                <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 shadow-2xl h-[600px] flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 text-center">Deployment Details</h2>

                    {/* GitHub Info */}
                    <div className="mb-8">
                        <div className="flex items-center gap-6 text-white text-base font-medium">
                            <div className="flex items-center gap-1">
                                <FiGithub className="text-gray-400" />
                                <span>{username}</span>
                                <span className="text-gray-400">/</span>
                                <span>{repo}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <FiGitBranch className="text-gray-400" />
                                {loadingBranches ? (
                                    <span>Loading branches...</span>
                                ) : errorBranches ? (
                                    <span className="text-red-500">Failed to load branches</span>
                                ) : (
                                    <select
                                        value={selectedBranch}
                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                        className="bg-transparent text-white focus:outline-none cursor-pointer appearance-none pr-6"
                                        disabled={branches.length === 0}
                                        style={{ WebkitAppearance: 'none' }}
                                    >
                                        {branches.map((branch, i) => (
                                            <option
                                                key={i}
                                                value={branch.name}
                                                className="bg-[#111] text-white"
                                            >
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Environment Variables */}
                    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 shadow-xl flex-1">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold mb-4">Environment Variables</h3>
                            <button
                                onClick={handleAddEnvVar}
                                className={`p-2 hover:bg-gray-800 rounded-full ${isAddButtonDisabled() ? 'cursor-not-allowed' : ''}`}
                                title="Add"
                                disabled={isAddButtonDisabled()}
                            >
                                <FiPlus className="text-green-500" />
                            </button>
                        </div>
                        <div
                            ref={envVarContainerRef}
                            className="overflow-auto max-h-[200px] space-y-3 mb-4"
                        >
                            {envVars.length === 0 ? (
                                <p className="text-gray-500 text-center">No environment variables added yet.</p>
                            ) : (
                                envVars.map((envVar, index) => (
                                    <div key={index} className="flex items-center justify-between gap-3 mb-3">
                                        <div className="flex gap-3 w-full">
                                            <input
                                                type="text"
                                                placeholder="Key"
                                                value={envVar.key}
                                                onChange={(e) => handleEnvVarChange(index, 'key', e.target.value)}
                                                className="w-1/2 px-3 py-2 rounded-md bg-black border border-gray-700 text-white"
                                                disabled={!envVar.isEditing}
                                                autoFocus={envVar.isEditing}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={envVar.value}
                                                onChange={(e) => handleEnvVarChange(index, 'value', e.target.value)}
                                                className="w-1/2 px-3 py-2 rounded-md bg-black border border-gray-700 text-white"
                                                disabled={!envVar.isEditing}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!envVar.isEditing ? (
                                                <button
                                                    onClick={() => handleEditEnvVar(index)}
                                                    className="p-2 hover:bg-gray-800 rounded-full"
                                                    title="Edit"
                                                >
                                                    <FiEdit className="text-yellow-500" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSaveEnvVar(index)}
                                                    className="p-2 hover:bg-gray-800 rounded-full"
                                                    title="Save"
                                                    disabled={!envVar.key || !envVar.value}
                                                >
                                                    <FiSave className="text-blue-500" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRemoveEnvVar(index)}
                                                className="p-2 hover:bg-gray-800 rounded-full"
                                                title="Remove"
                                            >
                                                <FiTrash className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Deploy Button */}
                    <div className="mt-5 text-center flex justify-center gap-4">
                        {isDeployed ? (
                            <>
                                <a
                                    href={`https://deployment-build-artifacts-bucket.s3.us-east-1.amazonaws.com/__outputs/${deploymentId}/index.html`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold transition bg-green-600 hover:bg-green-700 text-white`}
                                >
                                    View Deployment
                                </a>
                                <button
                                    onClick={() => navigate('/home')}
                                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold transition bg-gray-600 hover:bg-gray-700 text-white`}
                                >
                                    <FiHome size={18} />
                                    Home
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleDeploy}
                                disabled={isDeployDisabled}
                                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold transition ${isDeployDisabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                {isDeploying ? 'Deploying...' : 'Deploy'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Panel - Logs */}
                <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 shadow-2xl h-[600px] w-full">
                    <h2 className="text-2xl font-bold mb-4 text-center">Build Logs</h2>
                    <div
                        ref={logContainerRef}
                        className="h-[calc(100%-50px)] overflow-y-auto overflow-x-hidden bg-[#111] border border-gray-700 rounded-xl p-4"
                    >
                        {logs.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500">
                                    {isDeploying ? 'Waiting for logs...' : 'No logs available. Click Deploy to start.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {logs.map((log, index) => (
                                    <div
                                        key={index}
                                        className={`text-sm font-mono py-1 px-2 rounded ${log.log_level === 'ERROR' ? 'bg-red-900/20 text-red-400' :
                                            log.log_level === 'WARN' ? 'bg-yellow-900/20 text-yellow-400' :
                                                'text-gray-400'
                                            }`}
                                    >
                                        <span className="text-gray-500 mr-2">{log.elapsedTime}</span>
                                        {log.log_message}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Deploy;
