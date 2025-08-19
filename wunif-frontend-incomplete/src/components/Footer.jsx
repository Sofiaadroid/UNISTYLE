import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <p>&copy; {new Date().getFullYear()} UNISTYLE PRO. Todos los derechos reservados.</p>
                <p className="footer-text">Unistyle Pro - Desarrollo de páginas web para ventas online.</p>
                <div className="footer-links">
                    <a href="#" className="footer-link">Privacidad</a>
                    <a href="#" className="footer-link">Términos</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
