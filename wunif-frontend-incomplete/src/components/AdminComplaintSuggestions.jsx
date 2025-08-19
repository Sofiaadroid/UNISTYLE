import React, { useState, useEffect, useCallback } from 'react';

const AdminComplaintSuggestions = () => {
    const [complaintsSuggestions, setComplaintsSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // Para mensajes de éxito/error en la UI

    // Estado para la respuesta del admin
    const [replyContent, setReplyContent] = useState('');
    const [replyingToId, setReplyingToId] = useState(null); // ID de la queja/sugerencia a la que se está respondiendo

    const API_BASE_URL = 'http://localhost:3003/api';
    const userRole = localStorage.getItem('userRole'); // Obtener el rol del usuario logueado

    // Función para obtener todas las quejas y sugerencias
    const fetchComplaintsSuggestions = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage(''); // Limpiar mensajes al recargar
        const token = localStorage.getItem('token');

        if (!token) {
            setError('Error: No estás autenticado. Por favor, inicia sesión como administrador.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/complaints-suggestions`, {
                headers: {
                    'x-auth-token': token,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setComplaintsSuggestions(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Error al cargar las quejas y sugerencias.');
            }
        } catch (err) {
            console.error('Error fetching complaints/suggestions:', err);
            setError('Error de conexión al servidor al cargar quejas y sugerencias.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComplaintsSuggestions();
    }, [fetchComplaintsSuggestions]);

    // Función para eliminar una queja/sugerencia
    const handleDeleteComplaintSuggestion = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta queja/sugerencia?')) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/complaints-suggestions/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                fetchComplaintsSuggestions(); // Recargar la lista
            } else {
                setError(data.message || 'Error al eliminar la queja/sugerencia.');
            }
        } catch (err) {
            console.error('Error deleting complaint/suggestion:', err);
            setError('Error de conexión al servidor al eliminar.');
        } finally {
            setTimeout(() => setMessage(''), 5000);
            setTimeout(() => setError(''), 5000);
        }
    };

    // Función para iniciar el modo de respuesta
    const handleReplyClick = (id) => {
        setReplyingToId(id);
        setReplyContent(''); // Limpiar el contenido de la respuesta anterior
    };

    // Función para cancelar el modo de respuesta
    const handleCancelReply = () => {
        setReplyingToId(null);
        setReplyContent('');
    };

    // Función para enviar la respuesta
    const handleSubmitReply = async (id) => {
        if (!replyContent.trim()) {
            setError('La respuesta no puede estar vacía.');
            return;
        }
        if (replyContent.trim().length > 1000) {
            setError('La respuesta no puede exceder los 1000 caracteres.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/complaints-suggestions/${id}/reply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ replyContent }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                handleCancelReply(); // Salir del modo de respuesta
                fetchComplaintsSuggestions(); // Recargar la lista para ver la respuesta
            } else {
                setError(data.message || 'Error al enviar la respuesta.');
            }
        } catch (err) {
            console.error('Error submitting reply:', err);
            setError('Error de conexión al servidor al enviar la respuesta.');
        } finally {
            setTimeout(() => setMessage(''), 5000);
            setTimeout(() => setError(''), 5000);
        }
    };

    if (loading) {
        return <p className="loading-message">Cargando quejas y sugerencias...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    // Solo super-admin tiene acceso completo (eliminar y responder)
    const canManage = userRole === 'super-admin';

    return (
        <div className="admin-section messages-section">
            <h3 className="section-title">Quejas y Sugerencias de Usuarios</h3>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>} {/* Mostrar errores aquí también */}

            {complaintsSuggestions.length > 0 ? (
                <div className="messages-list">
                    {complaintsSuggestions.map((item) => (
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
                                <div className="admin-reply-section">
                                    <p className="admin-reply-label">Respuesta del Administrador ({item.repliedBy || 'N/A'}):</p>
                                    <div className="admin-reply-content">
                                        {item.reply}
                                    </div>
                                    <p className="admin-reply-date">Respondido el: {new Date(item.repliedAt).toLocaleString()}</p>
                                </div>
                            )}

                            {canManage && ( // Solo mostrar opciones de gestión si es super-admin
                                <div className="admin-actions-footer">
                                    {replyingToId === item._id ? (
                                        <div className="reply-form-container">
                                            <textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Escribe tu respuesta aquí..."
                                                className="form-textarea reply-textarea"
                                                rows="3"
                                                maxLength="1000"
                                            ></textarea>
                                            <div className="reply-buttons">
                                                <button
                                                    onClick={() => handleSubmitReply(item._id)}
                                                    className="admin-action-button reply-button"
                                                >
                                                    Enviar Respuesta
                                                </button>
                                                <button
                                                    onClick={handleCancelReply}
                                                    className="admin-action-button cancel-button"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="action-buttons-group">
                                            <button
                                                onClick={() => handleReplyClick(item._id)}
                                                className="admin-action-button edit-button" // Reutilizamos estilo de edit
                                            >
                                                {item.reply ? 'Editar Respuesta' : 'Responder'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComplaintSuggestion(item._id)}
                                                className="admin-action-button delete-button"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-messages-message">No hay quejas o sugerencias en este momento.</p>
            )}
        </div>
    );
};

export default AdminComplaintSuggestions;
