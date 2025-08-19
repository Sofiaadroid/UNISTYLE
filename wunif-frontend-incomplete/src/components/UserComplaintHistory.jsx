import React, { useState, useEffect, useCallback } from 'react';

const UserComplaintHistory = ({ username }) => {
    const [userComplaintsSuggestions, setUserComplaintsSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://localhost:3003/api';

    // Función para obtener las quejas/sugerencias del usuario actual
    const fetchUserComplaintsSuggestions = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');

        if (!token) {
            setError('Error: No estás autenticado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/complaints-suggestions`, {
                headers: {
                    'x-auth-token': token,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUserComplaintsSuggestions(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Error al cargar tus quejas y sugerencias.');
            }
        } catch (err) {
            console.error('Error fetching user complaints/suggestions:', err);
            setError('Error de conexión al servidor al cargar tus quejas y sugerencias.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserComplaintsSuggestions();
    }, [fetchUserComplaintsSuggestions]);

    if (loading) {
        return <p className="loading-message">Cargando tu historial de quejas y sugerencias...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="user-complaint-history-container">
            <h3 className="user-panel-subtitle">Tu Historial de Quejas y Sugerencias</h3>
            {userComplaintsSuggestions.length > 0 ? (
                <div className="messages-list"> {/* Reutilizamos la clase messages-list para la cuadrícula */}
                    {userComplaintsSuggestions.map((item) => (
                        <div key={item._id} className="message-card complaint-suggestion-card">
                            <span className="message-icon">{item.type === 'queja' ? '🚨' : '💡'}</span>
                            <p className="message-header">
                                <span className="message-name">{item.username}</span> - <span className="message-type">{item.type === 'queja' ? 'Queja' : 'Sugerencia'}</span>
                            </p>
                            <p className="message-subject">Asunto: {item.subject}</p>
                            <div className="message-content">
                                {item.message}
                            </div>
                            <p className="message-timestamp">Enviado el: {new Date(item.createdAt).toLocaleString()}</p>
                            <p className="message-status">Estado: <span className={`status-${item.status}`}>{item.status}</span></p>

                            {item.reply && (
                                <div className="user-reply-section">
                                    <p className="user-reply-label">Respuesta de la Empresa ({item.repliedBy || 'Administrador'}):</p>
                                    <div className="user-reply-content">
                                        {item.reply}
                                    </div>
                                    <p className="user-reply-date">Respondido el: {new Date(item.repliedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-messages-message">No has enviado ninguna queja o sugerencia aún.</p>
            )}
        </div>
    );
};

export default UserComplaintHistory;
