import React, { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import ComplaintSuggestionForm from './ComplaintSuggestionForm'; // Importa el formulario para enviar
import UserComplaintHistory from './UserComplaintHistory'; // Importa el historial de quejas/sugerencias

// Componente para mostrar la lista de noticias dentro del panel de usuario
const UserNewsDisplay = ({ onSelectNewsPost }) => {
    const [newsPosts, setNewsPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://localhost:3003/api';

    const fetchNewsPosts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/news`);
            if (response.ok) {
                const data = await response.json();
                setNewsPosts(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Error al cargar las noticias.');
            }
        } catch (err) {
            console.error('Error fetching news posts:', err);
            setError('Error de conexión al servidor al cargar noticias.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNewsPosts();
    }, [fetchNewsPosts]);

    if (loading) {
        return <p className="loading-message">Cargando noticias...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="user-news-section">
            <h3 className="user-panel-subtitle">Últimas Noticias</h3>
            {newsPosts.length > 0 ? (
                <div className="news-posts-grid">
                    {newsPosts.map((post) => (
                        <div key={post._id} className="news-post-card-public">
                            <div className="news-image-wrapper">
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="news-image"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E0E7FF/4338CA?text=Noticia'; }}
                                />
                            </div>
                            <div className="news-content-wrapper">
                                <h4 className="news-post-public-title" style={{ fontFamily: post.fontFamily }}>
                                    {post.title}
                                </h4>
                                <div className="news-post-public-meta">
                                    <span className="news-post-public-author">Por: {post.author}</span>
                                    <span className="news-post-public-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div
                                    className="news-post-public-content"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                                ></div>
                                <button
                                    onClick={() => onSelectNewsPost(post._id)}
                                    className="read-more-button"
                                >
                                    Leer más
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-messages-message">No hay noticias publicadas aún.</p>
            )}
        </div>
    );
};


const UserPanel = ({ username, onSelectNewsPost }) => {
    const [activeTab, setActiveTab] = useState('news'); // Estado para la pestaña activa

    return (
        <section className="user-panel-section">
            <div className="container user-panel-container">
                <h2 className="user-panel-title">Bienvenido, {username}!</h2>
                
                <div className="user-panel-tabs">
                    <button
                        className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
                        onClick={() => setActiveTab('news')}
                    >
                        Noticias
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'complaints' ? 'active' : ''}`}
                        onClick={() => setActiveTab('complaints')}
                    >
                        Enviar Queja/Sugerencia
                    </button>
                    {/* Nueva pestaña para el historial de quejas/sugerencias */}
                    <button
                        className={`tab-button ${activeTab === 'complaintHistory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('complaintHistory')}
                    >
                        Mi Historial de Quejas/Sugerencias
                    </button>
                </div>

                <div className="user-panel-content">
                    {activeTab === 'news' && (
                        <UserNewsDisplay onSelectNewsPost={onSelectNewsPost} />
                    )}
                    {activeTab === 'complaints' && (
                        <ComplaintSuggestionForm username={username} />
                    )}
                    {activeTab === 'complaintHistory' && (
                        <UserComplaintHistory username={username} />
                    )}
                </div>
            </div>
        </section>
    );
};

export default UserPanel;
