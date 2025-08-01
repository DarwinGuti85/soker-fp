
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { EyeIcon, EyeOffIcon, FacebookIcon, TwitterIcon } from './ui/icons';
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
            className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans bg-cover bg-center"
            style={{ backgroundImage: "url('https://lara-cultural.blogspot.com/2012/04/el-obelisco-monumento-construido-en.html')" }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 w-full h-full bg-black/50"></div>
            
            {/* Login Form Container */}
            <div className="relative z-10 w-full max-w-sm bg-black/40 backdrop-blur-md rounded-xl shadow-2xl p-8 space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <img src="https://i.ibb.co/3s3wz5c/soker-logo.jpg" alt="Logo SOKER FP" className="w-20 h-20 mx-auto rounded-full mb-3" />
                    <h1 className="text-2xl font-bold text-white tracking-wider">Bienvenido</h1>
                    <p className="text-gray-300 text-sm">¿Ya tienes una cuenta?</p>
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
                            className="w-full px-4 py-2.5 bg-black/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-brand-orange/50 focus:border-brand-orange focus:outline-none transition-colors duration-300"
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
                            className="w-full px-4 py-2.5 bg-black/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-brand-orange/50 focus:border-brand-orange focus:outline-none transition-colors duration-300"
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
                    
                    <div className="flex items-center pt-2">
                        <hr className="flex-grow border-gray-600" />
                        <span className="mx-2 text-gray-400 text-xs font-semibold">O Inicia Sesión Con</span>
                        <hr className="flex-grow border-gray-600" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button type="button" className="w-full flex items-center justify-center gap-2 py-2 bg-gray-200/95 hover:bg-white text-gray-800 font-semibold rounded-md transition-colors duration-300">
                           <FacebookIcon className="w-5 h-5"/>
                            Facebook
                        </button>
                        <button type="button" className="w-full flex items-center justify-center gap-2 py-2 bg-gray-200/95 hover:bg-white text-gray-800 font-semibold rounded-md transition-colors duration-300">
                            <TwitterIcon className="w-5 h-5"/>
                            Twitter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
