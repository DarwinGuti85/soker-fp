
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { EyeIcon, EyeOffIcon } from './ui/icons';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [loginInput, setLoginInput] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(loginInput, password);
            if (user) {
                navigate('/dashboard');
            } else {
                setError('Credenciales incorrectas. Inténtalo de nuevo.');
                setPassword('');
            }
        } catch (err) {
            setError('Ha ocurrido un error inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden"
        >
            <div className="water"></div>
            
            {/* Login Form Container */}
            <div className="relative z-10 w-full max-w-sm bg-brand-bg-light/80 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl p-8 space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="font-extrabold text-5xl text-white tracking-tighter" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                        <span className="text-brand-orange">SOKER</span> FP
                    </h1>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-wider">Bienvenido</h2>
                        <p className="text-gray-300 text-sm">Ingresa tus credenciales para acceder.</p>
                    </div>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            id="loginInput"
                            type="text"
                            placeholder="Usuario o Email"
                            value={loginInput}
                            onChange={(e) => setLoginInput(e.target.value)}
                            className="w-full px-4 py-2.5 bg-brand-bg-dark/70 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-brand-orange/50 focus:border-brand-orange focus:outline-none transition-colors duration-300"
                            required
                            autoCapitalize="none"
                        />
                    </div>
                    
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-brand-bg-dark/70 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-brand-orange/50 focus:border-brand-orange focus:outline-none transition-colors duration-300"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-brand-orange transition-colors duration-300">
                            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                    
                    
                    <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" className="h-4 w-4 bg-transparent border-gray-500 text-brand-orange rounded focus:ring-brand-orange focus:ring-offset-0"/>
                            <label htmlFor="remember" className="text-gray-300">Recordarme</label>
                        </div>
                        <a href="#" className="font-medium text-brand-orange hover:text-orange-400">¿Olvidaste Contraseña?</a>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center !mt-2">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-orange text-white font-bold py-2.5 rounded-md transition-colors duration-300 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-brand-orange disabled:bg-orange-900/70 disabled:cursor-not-allowed !mt-6"
                    >
                        {isLoading ? 'INGRESANDO...' : 'INGRESAR'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;