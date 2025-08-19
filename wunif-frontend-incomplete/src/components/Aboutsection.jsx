import React from 'react';

const AboutSection = () => {
    return (
        <section className="about-section">
            <div className="container">
                <h3 className="about-title">¿Quiénes Somos?</h3>
                <p className="about-text">
                    En UNISTYLE PRO, nos especializamos en el desarrollo de páginas web modernas y eficientes utilizando Vite y React, enfocadas en potenciar ventas online. Creamos soluciones digitales personalizadas para que tu negocio crezca en internet, con tiendas virtuales rápidas, seguras y fáciles de administrar.
                </p>
                <p className="about-text">
                    Nuestro equipo está liderado por la experiencia y pasión de <span className="highlight">Joan Rodriguez</span>, la creatividad de <span className="highlight">Laura Rueda</span> y la visión estratégica de <span className="highlight">Diego Garces</span>.
                </p>
                <div className="about-icons">
                    <div className="icon-card">
                        <span>💡</span>
                        <p>Calidad</p>
                    </div>
                    <div className="icon-card">
                        <span>🧵</span>
                        <p>Confort</p>
                    </div>
                    <div className="icon-card">
                        <span>💖</span>
                        <p>Orgullo</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;