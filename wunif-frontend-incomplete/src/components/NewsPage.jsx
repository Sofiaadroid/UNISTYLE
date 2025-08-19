import React, { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify'; // Importa DOMPurify para sanitizar HTML

const NewsPage = ({ onSelectNewsPost }) => {
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
        return (
            <section className="news-page-section">
                <div className="container news-page-container">
                    <p className="loading-message">Cargando noticias...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="news-page-section">
                <div className="container news-page-container">
                    <p className="error-message">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="news-page-section">
            <div className="container news-page-container">
                <h2 className="news-page-title">Últimas Noticias</h2>
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
                                    <h3 className="news-post-public-title" style={{ fontFamily: post.fontFamily }}>
                                        {post.title}
                                    </h3>
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
        </section>
    );
};

export default NewsPage;
