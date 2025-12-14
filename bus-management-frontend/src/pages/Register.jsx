import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, Loader2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import busLogo from '../assets/bus_logo.png';

export default function Register() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = React.useState('');
    const [selectedTab, setSelectedTab] = React.useState('Passenger'); // Passenger or Driver

    const onSubmit = async (data) => {
        try {
            await registerUser({ ...data, userType: selectedTab });
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Registration failed. Email might be taken.');
            }
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-white overflow-hidden">
            {/* Left Panel - Brand (Identical to Login) */}
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
                        Join our community and start managing your transportation needs effectively.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 bg-white relative py-12">
                {/* Mobile Logo */}
                <div className="lg:hidden mb-8 text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <img src={busLogo} alt="Bus Manager" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Bus Manager</h2>
                </div>

                <div className="w-full max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Create Account</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                            {error}
                        </div>
                    )}

                    {/* Role Selection Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-full mb-8 relative">
                        <button
                            type="button"
                            onClick={() => setSelectedTab('Passenger')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all relative z-10 ${selectedTab === 'Passenger' ? 'text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Passenger
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTab('Driver')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all relative z-10 ${selectedTab === 'Driver' ? 'text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Driver
                        </button>
                        {/* Animated background pill for tabs could be added here for extra flair, using absolute positioning and transform based on state */}
                        <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow transition-all duration-300 ease-in-out ${selectedTab === 'Driver' ? 'left-[50%]' : 'left-1'}`}></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-6">
                            <div className="group relative">
                                <label className="block text-sm font-semibold text-slate-600 mb-1 transition-colors group-focus-within:text-blue-600">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <input
                                        {...register('name', { required: 'Name is required' })}
                                        type="text"
                                        className="peer w-full py-3 pr-10 border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-colors bg-transparent placeholder-transparent"
                                        placeholder="John Doe"
                                        id="name"
                                    />
                                    <input className="hidden" type="text" autoComplete="name" />
                                    <span className="absolute right-0 bottom-3 text-slate-400 peer-focus:text-blue-600 transition-colors">
                                        <User size={20} />
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1">Enter your full name</div>
                                {errors.name && <p className="text-sm text-red-600 mt-1 absolute">{errors.name.message}</p>}
                            </div>

                            <div className="group relative">
                                <label className="block text-sm font-semibold text-slate-600 mb-1 transition-colors group-focus-within:text-blue-600">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        {...register('email', { required: 'Email is required' })}
                                        type="email"
                                        className="peer w-full py-3 pr-10 border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-colors bg-transparent placeholder-transparent"
                                        placeholder="you@example.com"
                                        id="email"
                                    />
                                    <input className="hidden" type="text" autoComplete="email" />
                                    <span className="absolute right-0 bottom-3 text-slate-400 peer-focus:text-blue-600 transition-colors">
                                        <Mail size={20} />
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1">Enter your email</div>
                                {errors.email && <p className="text-sm text-red-600 mt-1 absolute">{errors.email.message}</p>}
                            </div>

                            <div className="group relative">
                                <label className="block text-sm font-semibold text-slate-600 mb-1 transition-colors group-focus-within:text-blue-600">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <input
                                        {...register('phone', { required: 'Phone is required' })}
                                        type="tel"
                                        className="peer w-full py-3 pr-10 border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-colors bg-transparent placeholder-transparent"
                                        placeholder="+1 234 567 890"
                                        id="phone"
                                    />
                                    <span className="absolute right-0 bottom-3 text-slate-400 peer-focus:text-blue-600 transition-colors">
                                        <Phone size={20} />
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1">Enter your phone number</div>
                                {errors.phone && <p className="text-sm text-red-600 mt-1 absolute">{errors.phone.message}</p>}
                            </div>

                            {selectedTab === 'Driver' && (
                                <div className="group relative animate-in fade-in slide-in-from-top-4 duration-300">
                                    <label className="block text-sm font-semibold text-slate-600 mb-1 transition-colors group-focus-within:text-blue-600">
                                        Licence Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register('licenceNumber', { required: selectedTab === 'Driver' ? 'Licence is required' : false })}
                                            type="text"
                                            className="peer w-full py-3 pr-10 border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-colors bg-transparent placeholder-transparent"
                                            placeholder="LIC-123456"
                                            id="licence"
                                        />
                                        <span className="absolute right-0 bottom-3 text-slate-400 peer-focus:text-blue-600 transition-colors">
                                            <CreditCard size={20} />
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">Enter your driving licence number</div>
                                    {errors.licenceNumber && <p className="text-sm text-red-600 mt-1 absolute">{errors.licenceNumber.message}</p>}
                                </div>
                            )}

                            <div className="group relative">
                                <label className="block text-sm font-semibold text-slate-600 mb-1 transition-colors group-focus-within:text-blue-600">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                                        type="password"
                                        className="peer w-full py-3 pr-10 border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-colors bg-transparent placeholder-transparent"
                                        placeholder="••••••••"
                                        id="password"
                                    />
                                    <span className="absolute right-0 bottom-3 text-slate-400 peer-focus:text-blue-600 transition-colors">
                                        <Lock size={20} />
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1">Create a secure password</div>
                                {errors.password && <p className="text-sm text-red-600 mt-1 absolute">{errors.password.message}</p>}
                            </div>
                        </div>

                        <div className="pt-2 flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-full hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-semibold text-lg flex items-center justify-center"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : (selectedTab === 'Driver' ? 'Join as Driver' : 'Create Account')}
                            </button>

                            <Link
                                to="/login"
                                className="flex-1 bg-white text-slate-600 border-2 border-slate-200 py-3 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-lg flex items-center justify-center"
                            >
                                Sign In
                            </Link>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-xs">
                            By registering, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
