import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import busLogo from '../assets/bus_logo.png';

export default function Login() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = React.useState('');

    const onSubmit = async (data) => {
        try {
            await login(data.email, data.password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            toast.error('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-white overflow-hidden">
            {/* Left Panel - Brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative flex-col items-center justify-center text-white p-12 overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

                {/* Wavy Divider */}
                <div className="absolute top-0 right-0 bottom-0 w-24 h-full pointer-events-none z-10">
                    <svg
                        className="h-full w-full text-white fill-current"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        <path d="M0 0 C 40 10 40 30 20 50 C 0 70 60 90 0 100 H 100 V 0 Z" />
                        {/* Smoother wave overlay */}
                        <path d="M0 0 C 60 20 40 80 0 100" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                    </svg>
                </div>

                <div className="relative z-20 flex flex-col items-center text-center">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl mb-8 transform transition-transform hover:scale-105 duration-300">
                        <img src={busLogo} alt="Bus Manager" className="w-20 h-20 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">Welcome to</h1>
                    <h2 className="text-5xl font-light mb-8">Bus Manager</h2>
                    <p className="text-blue-100 text-lg max-w-md leading-relaxed">
                        Streamline your transportation operations with our comprehensive management solution.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 bg-white relative">
                {/* Mobile Logo for small screens */}
                <div className="lg:hidden mb-8 text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <img src={busLogo} alt="Bus Manager" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Bus Manager</h2>
                </div>

                <div className="w-full max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-slate-800 mb-8">Login to your account</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="group relative">
                            <label className="block text-sm font-semibold text-slate-600 mb-1 transition-colors group-focus-within:text-blue-600">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    {...register('email', { required: 'Email is required' })}
                                    type="email"
                                    className="peer w-full py-3 pr-10 border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-colors bg-transparent placeholder-transparent"
                                    placeholder="Enter your email"
                                    id="email"
                                />
                                {/* Custom placeholder behavior using label/css or just standard placeholder. 
                                     The design uses specific labels. I'll stick to top labels and valid placeholders for accessibility.
                                 */}
                                <input
                                    className="hidden"
                                    type="text"
                                    autoComplete="username"
                                /> {/* Accessibility helper */}

                                <span className="absolute right-0 bottom-3 text-slate-400 peer-focus:text-blue-600 transition-colors">
                                    <Mail size={20} />
                                </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Enter your mail</div>
                            {errors.email && <p className="text-sm text-red-600 mt-1 absolute">{errors.email.message}</p>}
                        </div>

                        <div className="group relative">
                            <label className="block text-sm font-semibold text-slate-600 mb-1 transition-colors group-focus-within:text-blue-600">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password', { required: 'Password is required' })}
                                    type="password"
                                    className="peer w-full py-3 pr-10 border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-colors bg-transparent placeholder-transparent"
                                    placeholder="Enter your password"
                                    id="password"
                                />
                                <span className="absolute right-0 bottom-3 text-slate-400 peer-focus:text-blue-600 transition-colors">
                                    <Lock size={20} />
                                </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Enter your password</div>
                            {errors.password && <p className="text-sm text-red-600 mt-1 absolute">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                <span className="ml-2 text-sm text-slate-500">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</a>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-full hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-semibold text-lg flex items-center justify-center"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : 'Login'}
                            </button>

                            <Link
                                to="/register"
                                className="flex-1 bg-white text-slate-600 border-2 border-slate-200 py-3 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-lg flex items-center justify-center"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-400 text-xs">
                            By logging in, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
