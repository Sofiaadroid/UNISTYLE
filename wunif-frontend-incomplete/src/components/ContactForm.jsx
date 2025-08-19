import React from 'react';

const ContactForm = ({ contactRef, formData, handleChange, handleSubmit, submissionStatus }) => {
    return (
        <section ref={contactRef} className="contact-section">
            <div className="container">
                <h3 className="contact-title">Contáctanos</h3>
                <p className="contact-subtitle">
                    ¿Tienes preguntas, necesitas una cotización o deseas más información sobre el desarrollo de tu página web para ventas online? ¡En Unistyle Pro estamos aquí para ayudarte!
                </p>
                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Nombre Completo</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name || ''} // Corregido: Asegura que el valor siempre sea una cadena
                            onChange={handleChange}
                            placeholder="Tu nombre"
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            placeholder="tu.correo@ejemplo.com"
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message" className="form-label">Tu Mensaje</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message || ''}
                            onChange={handleChange}
                            rows="6"
                            placeholder="Escribe tu mensaje aquí..."
                            className="form-textarea"
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={submissionStatus === 'Enviando...'}
                    >
                        {submissionStatus === 'Enviando...' ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                    {submissionStatus && submissionStatus !== 'Enviando...' && (
                        <p className={`submission-status ${submissionStatus.includes('Error') ? 'error' : 'success'}`}>
                            {submissionStatus}
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
