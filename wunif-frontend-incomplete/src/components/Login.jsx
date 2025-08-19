import React, { useState } from 'react';

// El componente Login ahora solo necesita la prop 'onLogin'
const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [message, setMessage] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const API_BASE_URL = '/api';

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoginError('');
        setMessage('');

        const endpoint = isRegistering ? 'register' : 'login';

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            console.log('Login.jsx - Data recibida del backend después de la autenticación:', data);

            if (response.ok) {
                setMessage(data.message);
                // Llama a la prop 'onLogin' y pasa todos los datos necesarios
                // App.jsx (handleLogin) será quien actualice los estados de isLoggedIn, userRole, etc.
                onLogin(data.token, (data.role ?? data.user?.role), username); // Pasa el token, el rol y el username

                setUsername('');
                setPassword('');

            } else {
                setLoginError(data.message || 'Ocurrió un error. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error de red o del servidor:', error);
            setLoginError('No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
        }
    };

    return (
        <section className="login-section flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="container login-container bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="login-title text-2xl font-bold text-center mb-6 text-gray-800">
                    {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
                </h3>
                <form onSubmit={handleAuth} className="login-form space-y-4">
                    <div className="form-group">
                        <label htmlFor="username" className="form-label block text-gray-700 text-sm font-bold mb-2">
                            Usuario:
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label block text-gray-700 text-sm font-bold mb-2">
                            Contraseña:
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    {loginError && <p className="login-error-message text-red-500 text-xs italic mb-4">{loginError}</p>}
                    {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}

                    <button
                        type="submit"
                        className="login-submit-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        {isRegistering ? 'Registrarme' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-blue-500 hover:text-blue-800 text-sm"
                    >
                        {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Login;
