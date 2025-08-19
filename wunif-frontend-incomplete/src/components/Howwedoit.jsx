import React from 'react';

const HowWeDoIt = React.forwardRef((props, ref) => {
    return (
        <section ref={ref} className="how-we-do-it-section">
            <div className="container">
                <h3 className="how-we-do-it-title">¿Cómo lo Hacemos?</h3>
                <div className="how-we-do-it-grid">
                    <div className="step-card">
                        <div className="step-icon-wrapper">
                            <span className="step-icon">🎨</span>
                        </div>
                        <h4 className="step-title">Diseño y Aprobación</h4>
                        <p className="step-description">
                            Trabajamos de la mano con nuestros clientes para entender sus necesidades y objetivos de venta online. Cada proyecto web es diseñado y desarrollado cumpliendo los más altos estándares de calidad, asegurando funcionalidad, estética y resultados efectivos para tu negocio.
                        </p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon-wrapper">
                            <span className="step-icon">✂️</span>
                        </div>
                        <h4 className="step-title">Producción y Gestión de Tallas</h4>
                        <p className="step-description">
                            Una vez aprobado el diseño, nuestro equipo de desarrollo implementa la solución web utilizando las mejores tecnologías y prácticas del sector. Nos aseguramos de que cada página sea rápida, segura y adaptada a las necesidades de tu negocio online.
                        </p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon-wrapper">
                            <span className="step-icon">✨</span>
                        </div>
                        <h4 className="step-title">Control de Calidad y Seguimiento de Entrega</h4>
                        <p className="step-description">
                            Realizamos un riguroso control de calidad antes de cada envío. Además, gestionamos y damos seguimiento continuo a la entrega de cada pedido, desde que sale de la fábrica hasta que llega a las manos de las familias, garantizando que el proceso sea transparente y eficiente.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
});

export default HowWeDoIt;