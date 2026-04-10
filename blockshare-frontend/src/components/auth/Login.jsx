import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import AuthService from '../../services/AuthService';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faShieldAlt, faCloudUploadAlt, faLock, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const SignupModal = ({ onClose }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { success, error, warning } = useToast();
    
    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (!username || !email || !password) {
            warning('Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            warning('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            const response = await AuthService.signup(username, email, password);
    
            if (response && response.success) {
                success('Account created successfully! You can now log in.');
                onClose();
            } else {
                error('Signup failed: ' + (response?.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Signup error:', err);
            error('An error occurred during signup. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/30 w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <FontAwesomeIcon icon={faCloudUploadAlt} className="text-2xl" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">Create Account</h2>
                        <p className="text-blue-100 mt-2 font-medium text-sm">Join the decentralized storage revolution</p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8 space-y-5">
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                            <FontAwesomeIcon icon={faUser} className="text-sm" />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-blue-50/30 transition-all font-medium"
                            required
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                            <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-blue-50/30 transition-all font-medium"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                            <FontAwesomeIcon icon={faLock} className="text-sm" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-blue-50/30 transition-all font-medium"
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSignup}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/25 relative"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                    Creating...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const navigate = useNavigate();
    const { login, isLoggedIn } = useAuth();
    const { success, error, warning } = useToast();

    React.useEffect(() => {
        if (isLoggedIn) {
            navigate('/app/dashboard/home');
        }
    }, [isLoggedIn, navigate]);

    const handleLogin = async () => {
        try {
            if (!username || !password) {
                warning('Please enter both username and password');
                return;
            }

            setLoading(true);

            const successLogin = await login(username, password);

            if (successLogin) {
                success('Login successful! Redirecting...');
                navigate('/app/dashboard');
            } else {
                error('Login failed. Please check your credentials.');
            }
        } catch (err) {
            error('Error during login. Please try again.');
            console.error('Error during login:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const openSignupModal = () => {
        setShowSignupModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex justify-center items-center p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/30 w-full max-w-md overflow-hidden relative z-10">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm shadow-lg">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-3xl" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight mb-2">BlockShare</h2>
                        <p className="text-blue-100 font-medium text-sm">Secure. Decentralized. Your Data, Your Control.</p>
                    </div>
                </div>

                {/* Login Form */}
                <div className="p-10 space-y-6">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Welcome Back</h3>
                        <p className="text-slate-500 font-medium text-sm">Sign in to access your decentralized storage</p>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                                <FontAwesomeIcon icon={faUser} className="text-sm" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-blue-50/30 transition-all font-medium"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                                <FontAwesomeIcon icon={faLock} className="text-sm" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-blue-50/30 transition-all font-medium"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            onClick={handleLogin}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/25 mt-6 relative"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                    Signing In...
                                </>
                            ) : (
                                'Login to Dashboard'
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-bold">New to BlockShare?</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={openSignupModal}
                            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 px-6 rounded-2xl border-2 border-slate-200 transition-all active:scale-95"
                        >
                            Create Account
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-10 py-6 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                        Powered by Ethereum & IPFS • Group no. 33
                    </p>
                </div>
            </div>
            
            {/* Signup Modal */}
            {showSignupModal && (
                <SignupModal onClose={() => setShowSignupModal(false)} />
            )}
        </div>
    );
};

export default Login;
