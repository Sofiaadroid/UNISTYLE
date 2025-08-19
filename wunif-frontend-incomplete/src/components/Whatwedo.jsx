import React from 'react';

const WhatWeDo = React.forwardRef((props, ref) => {
    return (
        <section ref={ref} className="what-we-do-section">
            <div className="container">
                <h3 className="what-we-do-title">¿Qué Hacemos?</h3>
                <div className="what-we-do-grid">
                    <div className="what-we-do-card">
                        <div className="card-header">
                            <span className="card-icon">👕</span>
                            <h4 className="card-title">Desarrollo de Tiendas Online Personalizadas</h4>
                        </div>
                        <p className="card-description">
                            Diseñamos y desarrollamos páginas web a medida utilizando Vite y React, especializadas en ventas online. Creamos tiendas virtuales con funcionalidades avanzadas, diseño atractivo y optimización para convertir visitantes en clientes.
                        </p>
                        <ul className="card-list">
                            <li>Diseño responsive y optimizado para dispositivos móviles.</li>
                            <li>Integración de pasarelas de pago seguras.</li>
                            <li>Panel de administración fácil de usar para gestionar productos y ventas.</li>
                        </ul>
                    </div>
                    <div className="what-we-do-card">
                        <div className="card-header">
                            <span className="card-icon">📦</span>
                            <h4 className="card-title">Distribución y Logística Eficiente</h4>
                        </div>
                        <p className="card-description">
                            Nos encargamos de todo el proceso: desde el diseño, desarrollo, implementación y soporte de tu tienda online. Garantizamos una experiencia digital fluida y segura para tus clientes, con soporte técnico y actualizaciones constantes.
                        </p>
                        <ul className="card-list">
                            <li>Soporte técnico y actualizaciones constantes.</li>
                            <li>Implementación de analítica para seguimiento de ventas y usuarios.</li>
                            <li>Optimización SEO para mayor visibilidad en buscadores.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
});

export default WhatWeDo;
