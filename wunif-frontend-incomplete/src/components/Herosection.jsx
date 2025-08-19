import React from 'react';

const HeroSection = ({ contactRef, scrollToSection }) => {
    return (
        <section ref={contactRef} className="hero-section">
            <div className="hero-background"></div>
            <div className="hero-content">
                <h2 className="hero-title">UNISTYLE PRO: Tu Aliado en Desarrollo Web para Ventas Online</h2>
                <p className="hero-subtitle">Creamos páginas web modernas y efectivas para impulsar tu negocio en internet.</p>
                <button
                    onClick={() => scrollToSection(contactRef)}
                    className="hero-button"
                >

                </button>
            </div>
        </section>
    );
};

export default HeroSection;