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
            className="min-h-screen font-sans relative overflow-hidden"
        >
            <div className="background">
                <svg className="illustration" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400">
                    <defs>
                        <style>
                            {`.st0{fill:#FF5B22;font-size:10px;font-family:monospace;}`}
                        </style>
                    </defs>
                    <g className="hover">
                        <g className="number-one"><text transform="matrix(1 0 0 1 100 80)" className="st0">1</text></g>
                        <g className="number-two"><text transform="matrix(1 0 0 1 250 120)" className="st0">0</text></g>
                        <g className="number-three"><text transform="matrix(1 0 0 1 50 200)" className="st0">0</text></g>
                        <g className="number-four"><text transform="matrix(1 0 0 1 400 50)" className="st0">1</text></g>
                        <g className="number-five"><text transform="matrix(1 0 0 1 300 250)" className="st0">1</text></g>
                        <g className="number-six"><text transform="matrix(1 0 0 1 120 300)" className="st0">0</text></g>
                        <g className="number-seven"><text transform="matrix(1 0 0 1 450 180)" className="st0">0</text></g>
                        <g className="number-eight"><text transform="matrix(1 0 0 1 20 150)" className="st0">1</text></g>
                        <g className="number-nine"><text transform="matrix(1 0 0 1 350 350)" className="st0">0</text></g>
                        <g className="number-ten"><text transform="matrix(1 0 0 1 480 20)" className="st0">1</text></g>
                        <g className="number-eleven"><text transform="matrix(1 0 0 1 270 20)" className="st0">0</text></g>
                        <g className="number-twelve"><text transform="matrix(1 0 0 1 180 220)" className="st0">1</text></g>
                        <g className="number-thirteen"><text transform="matrix(1 0 0 1 420 280)" className="st0">0</text></g>
                        <g className="number-fourteen"><text transform="matrix(1 0 0 1 150 50)" className="st0">0</text></g>
                        <g className="number-fifteen"><text transform="matrix(1 0 0 1 380 150)" className="st0">1</text></g>
                        <g className="number-sixteen"><text transform="matrix(1 0 0 1 80 350)" className="st0">1</text></g>
                        <g className="number-seventeen"><text transform="matrix(1 0 0 1 460 320)" className="st0">0</text></g>
                        <g className="number-eighteen"><text transform="matrix(1 0 0 1 200 10)" className="st0">1</text></g>
                        <g className="number-nineteen"><text transform="matrix(1 0 0 1 200 380)" className="st0">0</text></g>
                        <g className="number-twenty"><text transform="matrix(1 0 0 1 30 280)" className="st0">1</text></g>
                        <g className="number-twenty-one"><text transform="matrix(1 0 0 1 70 40)" className="st0">0</text></g>
                        <g className="number-twenty-two"><text transform="matrix(1 0 0 1 170 90)" className="st0">1</text></g>
                        <g className="number-twenty-three"><text transform="matrix(1 0 0 1 330 60)" className="st0">0</text></g>
                        <g className="number-twenty-four"><text transform="matrix(1 0 0 1 440 140)" className="st0">1</text></g>
                        <g className="number-twenty-five"><text transform="matrix(1 0 0 1 80 180)" className="st0">0</text></g>
                        <g className="number-twenty-six"><text transform="matrix(1 0 0 1 260 270)" className="st0">1</text></g>
                        <g className="number-twenty-seven"><text transform="matrix(1 0 0 1 390 230)" className="st0">0</text></g>
                        <g className="number-twenty-eight"><text transform="matrix(1 0 0 1 490 310)" className="st0">1</text></g>
                        <g className="number-twenty-nine"><text transform="matrix(1 0 0 1 10 330)" className="st0">0</text></g>
                        <g className="number-thirty"><text transform="matrix(1 0 0 1 160 360)" className="st0">1</text></g>
                        <g className="number-thirty-one"><text transform="matrix(1 0 0 1 280 340)" className="st0">0</text></g>
                        <g className="number-thirty-two"><text transform="matrix(1 0 0 1 410 380)" className="st0">1</text></g>
                        <g className="number-thirty-three"><text transform="matrix(1 0 0 1 230 5)" className="st0">0</text></g>
                        <g className="number-thirty-four"><text transform="matrix(1 0 0 1 370 95)" className="st0">1</text></g>
                        <g className="number-thirty-five"><text transform="matrix(1 0 0 1 90 240)" className="st0">0</text></g>
                        <g className="number-thirty-six"><text transform="matrix(1 0 0 1 210 160)" className="st0">1</text></g>
                        <g className="number-thirty-seven"><text transform="matrix(1 0 0 1 310 110)" className="st0">0</text></g>
                        <g className="number-thirty-eight"><text transform="matrix(1 0 0 1 60 390)" className="st0">1</text></g>
                        <g className="number-thirty-nine"><text transform="matrix(1 0 0 1 470 250)" className="st0">0</text></g>
                        <g className="number-forty"><text transform="matrix(1 0 0 1 240 310)" className="st0">1</text></g>
                    </g>
                </svg>
            </div>
            
            {/* Login Form Container */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative z-10 w-full max-w-sm bg-brand-bg-light/80 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl p-8 space-y-6">
                    
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="login-neon-title">𝕊𝕆𝕂𝔼ℝ 𝔽ℙ</h1>
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
        </div>
    );
};

export default Login;