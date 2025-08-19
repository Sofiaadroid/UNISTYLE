import React, { useState } from 'react';

const ComplaintSuggestionForm = ({ username }) => {
    const [type, setType] = useState('sugerencia'); // 'queja' o 'sugerencia'
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState(''); // Estado para mensajes de éxito/error

    const API_BASE_URL = 'http://localhost:3003/api';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus('Enviando...');

        const token = localStorage.getItem('token');
        if (!token) {
            setSubmissionStatus('Error: No estás autenticado. Por favor, inicia sesión.');
            return;
        }

        if (!subject.trim() || !message.trim()) {
            setSubmissionStatus('Error: El asunto y el mensaje no pueden estar vacíos.');
            return;
        }
        if (subject.trim().length > 100) {
            setSubmissionStatus('Error: El asunto no puede exceder los 100 caracteres.');
            return;
        }
        if (message.trim().length > 1000) {
            setSubmissionStatus('Error: El mensaje no puede exceder los 1000 caracteres.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/complaints-suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token, // Envía el token de autenticación
                },
                body: JSON.stringify({ type, subject, message }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmissionStatus('¡Gracias! Tu ' + type + ' ha sido enviada exitosamente.');
                // Limpiar el formulario
                setSubject('');
                setMessage('');
                setType('sugerencia'); // Resetear a sugerencia por defecto
            } else {
                setSubmissionStatus(`Error al enviar: ${data.message || 'Inténtalo de nuevo.'}`);
            }
        } catch (error) {
            console.error('Error al enviar queja/sugerencia:', error);
            setSubmissionStatus('Error de conexión. Por favor, intenta de nuevo más tarde.');
        } finally {
            // Limpiar el mensaje de estado después de un tiempo
            setTimeout(() => setSubmissionStatus(''), 5000);
        }
    };

    return (
        <div className="complaint-suggestion-form-container">
            <h3 className="user-panel-subtitle">Envía tu Queja o Sugerencia</h3>
            <p className="form-description">Tu opinión es importante para nosotros. Por favor, rellena el siguiente formulario.</p>
            
            <form onSubmit={handleSubmit} className="complaint-form">
                <div className="form-group">
                    <label htmlFor="type" className="form-label">Tipo:</label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="form-select"
                        required
                    >
                        <option value="sugerencia">Sugerencia</option>
                        <option value="queja">Queja</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="subject" className="form-label">Asunto:</label>
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="form-input"
                        maxLength="100"
                        placeholder="Asunto corto (máx. 100 caracteres)"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="message" className="form-label">Mensaje:</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="form-textarea"
                        rows="6"
                        maxLength="1000"
                        placeholder="Describe tu queja o sugerencia (máx. 1000 caracteres)"
                        required
                    ></textarea>
                </div>

                {submissionStatus && (
                    <p className={`submission-status ${submissionStatus.includes('Error') ? 'error' : 'success'}`}>
                        {submissionStatus}
                    </p>
                )}

                <button type="submit" className="submit-button">
                    Enviar {type === 'queja' ? 'Queja' : 'Sugerencia'}
                </button>
            </form>
        </div>
    );
};

export default ComplaintSuggestionForm;
