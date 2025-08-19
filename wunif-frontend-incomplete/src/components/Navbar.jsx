import React from 'react';

const Navbar = ({ scrollToSection, refs, isLoggedIn, setIsLoggedIn, setCurrentPage, currentPage, userRole, handleLogout, onBackToNewsList, selectedNewsPostId }) => {

    const handleNewsButtonClick = () => {
        // Si estamos viendo una noticia individual, volvemos a la lista de noticias
        if (selectedNewsPostId) {
            onBackToNewsList();
        } else {
            // Si no, simplemente vamos a la página de noticias
            setCurrentPage('news');
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-content container">
                <span className="navbar-brand">UNISTYLE PRO</span>
                <div className="navbar-nav">
                    {/* Botón de Inicio siempre visible */}
                    <button onClick={() => { setCurrentPage('home'); scrollToSection(refs.homeRef); }} className="nav-button">Inicio</button>
                    
                    {/* Botón de Noticias siempre visible */}
                    <button onClick={handleNewsButtonClick} className="nav-button">Noticias</button>
                    
                    {/* Botón de Contacto siempre visible */}
                    <button onClick={() => { setCurrentPage('home'); scrollToSection(refs.contactRef); }} className="nav-button">Contacto</button>
                    
                    {isLoggedIn ? (
                        <>
                            {/* Panel de Usuario Normal solo visible para rol 'user' */}
                            {userRole === 'user' && (
                                <button onClick={() => setCurrentPage('user-panel')} className="nav-button nav-button-highlight">Mi Panel</button>
                            )}

                            {/* Panel Admin solo visible para roles 'admin' o 'super-admin' */}
                            {(userRole === 'admin' || userRole === 'super-admin') && (
                                <button onClick={() => setCurrentPage('admin')} className="nav-button nav-button-highlight">Panel Admin</button>
                            )}
                            {/* Botón de Cerrar Sesión */}
                            <button onClick={handleLogout} className="nav-button">Cerrar Sesión</button>
                        </>
                    ) : (
                        // Botón de Iniciar Sesión si no está logueado
                        <button onClick={() => setCurrentPage('login')} className="nav-button nav-button-highlight">Iniciar Sesión</button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
