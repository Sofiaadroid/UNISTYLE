import DOMPurify from 'dompurify'; // Para sanitizar el HTML del contenido de noticias
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Asumo que usas react-router-dom para obtener el ID de la noticia

// Asume que tienes un archivo CSS general como App.css o SingleNewsPage.css
// import '../App.css'; 

const SingleNewsPage = () => {
    const { id } = useParams(); // Obtener el ID de la noticia de la URL
    const [newsPost, setNewsPost] = useState(null);
    const [loadingNews, setLoadingNews] = useState(true);
    const [newsError, setNewsError] = useState('');
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [commentsError, setCommentsError] = useState('');
    const [newCommentContent, setNewCommentContent] = useState('');
    const [commentActionMessage, setCommentActionMessage] = useState('');

    const API_BASE_URL = '/api'; // Proxy de Vite

    const loggedInUserRole = localStorage.getItem('userRole');
    const loggedInUsername = localStorage.getItem('username');

    // Función para obtener la noticia específica
    const fetchNewsPost = useCallback(async () => {
        setLoadingNews(true);
        setNewsError('');
        try {
            const response = await fetch(`${API_BASE_URL}/news/${id}`);
            if (response.ok) {
                const data = await response.json();
                setNewsPost(data);
            } else {
                const errorData = await response.json();
                setNewsError(errorData.message || 'Error al cargar la noticia.');
            }
        } catch (err) {
            console.error('Error fetching news post:', err);
            setNewsError('Error de conexión al servidor al cargar la noticia.');
        } finally {
            setLoadingNews(false);
        }
    }, [API_BASE_URL, id]);

    // Función para obtener los comentarios de la noticia
    const fetchComments = useCallback(async () => {
        setLoadingComments(true);
        setCommentsError('');
        try {
            const response = await fetch(`${API_BASE_URL}/comments/${id}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            } else {
                const errorData = await response.json();
                setCommentsError(errorData.message || 'Error al cargar comentarios.');
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
            setCommentsError('Error de conexión al servidor al cargar comentarios.');
        } finally {
            setLoadingComments(false);
        }
    }, [API_BASE_URL, id]);

    // Función para añadir un nuevo comentario
    const handleAddComment = async (e) => {
        e.preventDefault();
        setCommentActionMessage('');
        if (!newCommentContent.trim()) {
            setCommentActionMessage({ type: 'error', message: 'El comentario no puede estar vacío.' });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setCommentActionMessage({ type: 'error', message: 'Debes iniciar sesión para comentar.' });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ postId: id, content: newCommentContent }),
            });

            const data = await response.json();
            if (response.ok) {
                setCommentActionMessage({ type: 'success', message: data.message });
                setNewCommentContent(''); // Limpiar el campo de comentario
                fetchComments(); // Recargar los comentarios para mostrar el nuevo
            } else {
                setCommentActionMessage({ type: 'error', message: data.message || 'Error al añadir comentario.' });
            }
        } catch (err) {
            console.error('Error adding comment:', err);
            setCommentActionMessage({ type: 'error', message: 'Error de conexión al servidor al añadir comentario.' });
        } finally {
            setTimeout(() => setCommentActionMessage(''), 5000);
        }
    };

    // Función para eliminar un comentario
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            return;
        }
        setCommentActionMessage('');
        const token = localStorage.getItem('token');
        if (!token) {
            setCommentActionMessage({ type: 'error', message: 'No estás autenticado para eliminar comentarios.' });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token },
            });
            const data = await response.json();
            if (response.ok) {
                setCommentActionMessage({ type: 'success', message: data.message });
                fetchComments(); // Recargar los comentarios para actualizar la lista
            } else {
                setCommentActionMessage({ type: 'error', message: data.message || 'Error al eliminar comentario.' });
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            setCommentActionMessage({ type: 'error', message: 'Error de conexión al servidor al eliminar comentario.' });
        } finally {
            setTimeout(() => setCommentActionMessage(''), 5000);
        }
    };


    useEffect(() => {
        fetchNewsPost();
        fetchComments();
    }, [fetchNewsPost, fetchComments]);

    if (loadingNews) {
        return <div className="container mt-8 text-center"><p className="loading-message">Cargando noticia...</p></div>;
    }

    if (newsError) {
        return <div className="container mt-8 text-center"><p className="error-message">{newsError}</p></div>;
    }

    if (!newsPost) {
        return <div className="container mt-8 text-center"><p className="no-data-message">Noticia no encontrada.</p></div>;
    }

    return (
        <div className="single-news-page-container container mx-auto p-4">
            <h1 className="news-title" style={{ fontFamily: newsPost.fontFamily }}>{newsPost.title}</h1>
            <p className="news-meta">Autor: {newsPost.author} | Fecha: {new Date(newsPost.createdAt).toLocaleDateString()}</p>
            {newsPost.imageUrl && (
                <div className="news-image-wrapper">
                    <img
                        src={newsPost.imageUrl}
                        alt={newsPost.title}
                        className="news-image"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x450/CCCCCC/FFFFFF?text=Imagen+no+disponible'; }}
                    />
                </div>
            )}
            <div className="news-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(newsPost.content) }}></div>

            <hr className="my-8 border-gray-300" />

            {/* Sección de Comentarios */}
            <div className="comments-section">
                <h2 className="comments-title">Comentarios</h2>
                {commentActionMessage && (
                    <p className={`submission-status ${commentActionMessage.type}`}>
                        {commentActionMessage.message}
                    </p>
                )}

                {/* Formulario para añadir comentario */}
                <form onSubmit={handleAddComment} className="comment-form">
                    <div className="form-group">
                        <label htmlFor="newCommentContent" className="form-label">Escribe tu comentario:</label>
                        <textarea
                            id="newCommentContent"
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            className="form-textarea"
                            rows="4"
                            placeholder="Tu comentario..."
                        ></textarea>
                    </div>
                    <button type="submit" className="submit-comment-button">Publicar Comentario</button>
                </form>

                {/* Lista de comentarios */}
                {loadingComments ? (
                    <p className="loading-message">Cargando comentarios...</p>
                ) : commentsError ? (
                    <p className="error-message">{commentsError}</p>
                ) : (
                    comments.length > 0 ? (
                        <div className="comments-list">
                            {comments.map((comment) => (
                                <div key={comment._id} className="comment-card">
                                    <p className="comment-author"><strong>{comment.author}</strong></p>
                                    <p className="comment-content">{comment.content}</p>
                                    <p className="comment-date">{new Date(comment.createdAt).toLocaleString()}</p>
                                    {/* Botón de eliminar comentario (solo si es el autor o admin/super-admin) */}
                                    {(loggedInUsername === comment.author || loggedInUserRole === 'admin' || loggedInUserRole === 'super-admin') && (
                                        <button
                                            onClick={() => handleDeleteComment(comment._id)}
                                            className="delete-comment-button"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-comments-message">No hay comentarios aún. ¡Sé el primero en comentar!</p>
                    )
                )}
            </div>
        </div>
    );
};

export default SingleNewsPage;
