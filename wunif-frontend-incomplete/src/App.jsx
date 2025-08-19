import React, { useState, useEffect, useRef } from 'react';

// Importación de componentes externos (NOMBRES CORREGIDOS)
import Navbar from './components/Navbar';
import Herosection from './components/Herosection'; // Corregido: Herosection
import Aboutsection from './components/Aboutsection'; // Corregido: Aboutsection
import Whatwedo from './components/Whatwedo'; // Corregido: Whatwedo
import Howwedoit from './components/Howwedoit'; // Corregido: Howwedoit
import ContactForm from './components/ContactForm'; // Corregido: ContactForm
import Footer from './components/Footer';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import NewsPage from './components/NewsPage';
import SingleNewsPage from './components/SingleNewsPage';
import UserPanel from './components/UserPanel';

import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'guest');
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedNewsPostId, setSelectedNewsPostId] = useState(null); // Estado para la noticia seleccionada

    // Estados para el formulario de contacto (ya existen en tu App.jsx)
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submissionStatus, setSubmissionStatus] = useState('');

    // Refs para las secciones (NOMBRES CORREGIDOS)
    const homeRef = useRef(null);
    const aboutRef = useRef(null); // Ref para Aboutsection
    const whatWeDoRef = useRef(null); // Ref para Whatwedo
    const howWeDoItRef = useRef(null); // Ref para Howwedoit
    const contactRef = useRef(null); // Ref para ContactForm

    const refs = {
        homeRef,
        aboutRef,
        whatWeDoRef,
        howWeDoItRef,
        contactRef,
    };

    const scrollToSection = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Manejar el inicio de sesión
    const handleLogin = (token, role, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('username', user);
        setIsLoggedIn(true);
        setUserRole(role);
        setUsername(user);
        // Redirigir según el rol
        if (role === 'super-admin' || role === 'admin') {
            setCurrentPage('admin');
        } else {
            setCurrentPage('user-panel'); // Usuario normal va a su panel
        }
    };

    // Manejar el cierre de sesión
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setUserRole('guest');
        setUsername('');
        setCurrentPage('home'); // Volver a la página de inicio
        setSelectedNewsPostId(null); // Limpiar cualquier noticia seleccionada
    };

    // Función para manejar la selección de una noticia
    const handleSelectNewsPost = (postId) => {
        setSelectedNewsPostId(postId);
        setCurrentPage('single-news'); // Cambiar a la vista de noticia individual
    };

    // Función para volver a la lista de noticias desde una noticia individual
    const handleBackToNewsList = () => {
        setSelectedNewsPostId(null);
        // Decide a dónde volver: si el usuario está en su panel, vuelve a la pestaña de noticias de su panel
        // Si estaba en la página pública de noticias, vuelve a esa.
        if (userRole === 'user' && currentPage === 'single-news') {
            setCurrentPage('user-panel');
        } else {
            setCurrentPage('news');
        }
    };

    // Manejadores para el formulario de contacto
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus('Enviando...');
        try {
            const response = await fetch('http://localhost:3003/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmissionStatus('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
                setFormData({ name: '', email: '', message: '' });
            } else {
                const errorData = await response.json();
                setSubmissionStatus(`Error al enviar el mensaje: ${errorData.message || 'Inténtalo de nuevo.'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            setSubmissionStatus('Error de conexión. Por favor, intenta de nuevo más tarde.');
        } finally {
            setTimeout(() => setSubmissionStatus(''), 5000);
        }
    };

    // Determinar qué contenido renderizar
    const renderContent = () => {
        switch (currentPage) {
            case 'home':
                return (
                    <>
                        <Herosection innerRef={homeRef} />
                        <Aboutsection innerRef={aboutRef} />
                        <Whatwedo innerRef={whatWeDoRef} />
                        <Howwedoit innerRef={howWeDoItRef} />
                        {/* CORREGIDO: Pasando las props necesarias a ContactForm */}
                        <ContactForm
                            innerRef={contactRef}
                            formData={formData}
                            handleChange={handleChange}
                            handleSubmit={handleSubmit}
                            submissionStatus={submissionStatus}
                        />
                    </>
                );
            case 'login':
                return <Login onLogin={handleLogin} />;
            case 'admin':
                return isLoggedIn && (userRole === 'admin' || userRole === 'super-admin') ? (
                    <AdminPanel userRole={userRole} username={username} />
                ) : (
                    <div className="admin-panel-section">
                        <div className="container admin-panel-container">
                            <p className="error-message">Acceso denegado. No tienes permiso para ver esta página.</p>
                        </div>
                    </div>
                );
            case 'news':
                return <NewsPage onSelectNewsPost={handleSelectNewsPost} />;
            case 'single-news':
                return <SingleNewsPage postId={selectedNewsPostId} onBack={handleBackToNewsList} />;
            case 'user-panel':
                return isLoggedIn && userRole === 'user' ? (
                    <UserPanel username={username} onSelectNewsPost={handleSelectNewsPost} />
                ) : (
                    <div className="admin-panel-section">
                        <div className="container admin-panel-container">
                            <p className="error-message">Acceso denegado. Debes ser un usuario normal para ver este panel.</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="App">
            <Navbar
                scrollToSection={scrollToSection}
                refs={refs}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
                userRole={userRole}
                handleLogout={handleLogout}
                onBackToNewsList={handleBackToNewsList}
                selectedNewsPostId={selectedNewsPostId}
            />
            {renderContent()}
            <Footer />
        </div>
    );
}

export default App;
