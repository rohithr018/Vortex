import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiLogIn, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/user/UserSlice';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loading } = useSelector((state) => state.user);

    // State management
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [username, setUsername] = useState('');
    const [githubProfile, setGithubProfile] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const mode = searchParams.get('mode');
    const isLogin = mode !== 'register';

    {/*Common classes*/ }
    const inputClass = 'w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-400 text-sm';
    const btnClass = 'w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition';
    const errorBoxClass = 'bg-red-800/20 text-red-400 border border-red-700 rounded-lg p-3 text-sm text-center font-medium';
    const successBoxClass = 'bg-green-800/20 text-green-400 border border-green-700 rounded-lg p-3 text-sm text-center font-medium';


    {/*Transitions*/ }
    const leftVariants = {
        initial: { opacity: 0, x: 80 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -80 }
    };

    const rightVariants = {
        initial: { opacity: 0, x: -80 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 80 }
    };
    {/*Login <-> Register*/ }
    const toggleMode = () => {
        const newMode = isLogin ? 'register' : 'login';
        navigate(`/auth?mode=${newMode}`);
        resetForm();
    };

    {/*Validate Input feilds*/ }
    const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,14}$/.test(password);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFullname('');
        setUsername('');
        setGithubProfile('');
        setError(null);
        setSuccess(null);
        setShowPassword(false);
    };

    {/*Login Function*/ }
    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;

        dispatch(loginStart());
        setError(null);

        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });

            dispatch(loginSuccess({ token: data.token, user: data.user }));

            setSuccess('Successful login, redirecting...');
            setTimeout(() => navigate('/home'), 1500);

        } catch (err) {
            const message = err.response?.data?.message || 'Login failed. Please try again.';

            dispatch(loginFailure(message));

            setError(message)
        }
    };

    {/*Register Function*/ }
    const handleRegister = async (e) => {
        e.preventDefault();
        if (localLoading) return;

        setError(null);
        setSuccess(null);

        if (!fullname || !username || !email || !password || !githubProfile) {
            return setError('Please fill out all fields.');
        }

        if (!validateEmail(email)) return setError('Please enter a valid email address.');
        if (!validatePassword(password)) return setError('Password must be at least 8 characters long and contain at least one letter and one number.');
        try {
            setLocalLoading(true);

            const { data } = await axios.post('http://localhost:5000/api/auth/register', { fullname, username, email, password, githubProfile });

            setSuccess(`${data.message}, Redirecting to Login`);

            setTimeout(() => {
                resetForm();
                setIsLogin(true);
            }, 1500);

        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed.';
            setError(message);
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] p-4">
            <div className="w-full max-w-5xl bg-[#0e0e0e] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col md:flex-row transition-all duration-700" style={{ minHeight: '550px' }}>

                {/* Left Panel: Login or Register */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-5 text-white bg-[#111111]">
                    <AnimatePresence mode="wait">
                        {isLogin ?
                            (
                                <motion.div
                                    key="login"
                                    initial={leftVariants.initial}
                                    animate={leftVariants.animate}
                                    exit={rightVariants.exit}
                                    transition={{ duration: 0.75, ease: 'easeInOut' }}
                                    className="w-full"
                                >
                                    <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                                        <FiLogIn size={28} />
                                        Login
                                    </h2>
                                    <form className="space-y-4 w-full max-w-sm mx-auto" onSubmit={handleLogin}>
                                        {/* Email*/}
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                                            required
                                        />

                                        {/* Eye Button*/}
                                        <div className="relative w-full">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                                                required
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                                aria-label="Toggle password visibility"
                                            >
                                                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                            </button>
                                        </div>

                                        {/* Error and success Block */}
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    key="login-error"
                                                    initial={{ opacity: 1 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.8 }}
                                                    className={errorBoxClass}
                                                >
                                                    {error}
                                                </motion.div>
                                            )}
                                            {success && (
                                                <motion.div
                                                    key="login-success"
                                                    initial={{ opacity: 1 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.8 }}
                                                    className={successBoxClass}
                                                >
                                                    {success}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Login button */}
                                        <button type="submit" className={btnClass} disabled={loading}>
                                            {loading ? 'Logging in...' : 'Login'}
                                        </button>
                                    </form>
                                </motion.div>

                            ) :
                            (
                                <motion.img
                                    key="login-img"
                                    initial={leftVariants.initial}
                                    animate={leftVariants.animate}
                                    exit={rightVariants.exit}
                                    transition={{ duration: 0.75 }}
                                    src="https://placehold.co/400x400?text=Login"
                                    alt="Login Illustration"
                                    className="rounded-lg max-h-100 object-cover shadow-xl border border-gray-700"
                                />
                            )
                        }
                    </AnimatePresence>
                </div>

                {/* Vertical Divider */}
                <div className="relative w-16 flex flex-col items-center justify-center bg-[#111111]">
                    <div className="h-full w-px bg-gray-700 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    <div
                        onClick={toggleMode}
                        className="z-10 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-gray-700 rounded-full px-3 py-3 cursor-pointer transition"
                    >
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div
                                    key="toggle-login"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center"
                                >
                                    <FiChevronRight size={20} />
                                    <span className="text-xs font-medium">Register</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="toggle-register"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center"
                                >
                                    <FiChevronLeft size={20} />
                                    <span className="text-xs font-medium">Login</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Panel: Register Form */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-10 text-white bg-[#111111]">
                    <AnimatePresence mode="wait">
                        {!isLogin ?
                            (
                                <motion.div
                                    key="register"
                                    initial={rightVariants.initial}
                                    animate={rightVariants.animate}
                                    exit={leftVariants.exit}
                                    transition={{ duration: 0.75, ease: 'easeInOut' }}
                                >
                                    <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                                        <FiUserPlus size={28} />
                                        Create an Account
                                    </h2>
                                    <form className="space-y-4 w-full max-w-sm mx-auto" onSubmit={handleRegister}>
                                        {/* Full Name*/}
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={fullname}
                                            onChange={(e) => setFullname(e.target.value)}
                                            className={inputClass}
                                            required
                                        />
                                        {/* Username*/}
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={inputClass}
                                            required
                                        />
                                        {/* Email*/}
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={inputClass}
                                            required
                                        />
                                        {/* Password + Eye Button*/}
                                        <div className="relative w-full">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`${inputClass} pr-10`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                            </button>
                                        </div>
                                        {/* Git URL*/}
                                        <input
                                            type="text"
                                            placeholder="GitHub Profile"
                                            value={githubProfile}
                                            onChange={(e) => setGithubProfile(e.target.value)}
                                            className={inputClass}
                                            required
                                        />
                                        {/* Error and Success Block*/}
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    key="register-error"
                                                    initial={{ opacity: 1 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.8 }}
                                                    className={errorBoxClass}
                                                >
                                                    {error}
                                                </motion.div>
                                            )}
                                            {success && (
                                                <motion.div
                                                    key="register-success"
                                                    initial={{ opacity: 1 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.8 }}
                                                    className={successBoxClass}
                                                >
                                                    {success}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <button type="submit" className={btnClass} disabled={localLoading}>
                                            {localLoading ? 'Registering...' : 'Register'}
                                        </button>
                                    </form>
                                </motion.div>
                            ) :
                            (
                                <motion.img
                                    key="register-img"
                                    initial={rightVariants.initial}
                                    animate={rightVariants.animate}
                                    exit={leftVariants.exit}
                                    transition={{ duration: 0.75 }}
                                    src="https://placehold.co/400x400?text=Register"
                                    alt="Register Illustration"
                                    className="rounded-lg max-h-100 object-cover shadow-xl border border-gray-700"
                                />
                            )
                        }
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Auth;
