import React, { useState, useEffect, useCallback } from 'react';
import AdminComplaintSuggestions from './AdminComplaintSuggestions'; // Importa el componente de Quejas/Sugerencias
import DOMPurify from 'dompurify'; // Para sanitizar el HTML del contenido de noticias
import ReactQuill from 'react-quill'; // Importa ReactQuill
import 'react-quill/dist/quill.snow.css'; // Importa los estilos de Quill


const AdminPanel = ({ userRole, username }) => {
    const [activeTab, setActiveTab] = useState('users'); // Estado para la pestaña activa

    // Estados para la gestión de usuarios
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState('');
    const [userActionMessage, setUserActionMessage] = useState(''); // Mensaje para éxito/error en acciones de usuario

    // Estados para la gestión de mensajes de contacto
    const [contactMessages, setContactMessages] = useState([]);
    const [loadingContactMessages, setLoadingContactMessages] = useState(true);
    const [contactMessagesError, setContactMessagesError] = useState('');
    const [contactMessageActionMessage, setContactMessageActionMessage] = useState(''); // Mensaje para éxito/error en acciones de mensajes

    // Estados para Publicaciones de Noticias
    const [newsPosts, setNewsPosts] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);
    const [newsError, setNewsError] = useState('');
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState(''); // Contendrá HTML de Quill
    const [newPostFontFamily, setNewPostFontFamily] = useState('Inter'); // Nueva propiedad para la fuente
    const [newPostImageUrl, setNewPostImageUrl] = useState(''); // Contendrá URL o Base64
    const [imagePreview, setImagePreview] = useState(''); // Para mostrar la miniatura de la imagen
    const [newsActionMessage, setNewsActionMessage] = useState(''); // Mensaje para éxito/error en acciones de noticias

    // Estados para Edición de Noticias
    const [isEditing, setIsEditing] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);

    // Estados para Quejas y Sugerencias
    const [complaintsSuggestions, setComplaintsSuggestions] = useState([]);
    const [loadingComplaintsSuggestions, setLoadingComplaintsSuggestions] = useState(true);
    const [complaintsSuggestionsError, setComplaintsSuggestionsError] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [selectedComplaintId, setSelectedComplaintId] = useState(null);
    const [complaintActionMessage, setComplaintActionMessage] = useState('');


    const API_BASE_URL = 'http://localhost:3003/api';

    // Obtener el rol y nombre de usuario del usuario logueado para la lógica de restricción
    const loggedInUserRole = localStorage.getItem('userRole');
    const loggedInUsername = localStorage.getItem('username');
    // Determinar si el usuario logueado es el super-admin
    const isSuperAdmin = loggedInUserRole === 'admin' && loggedInUsername === 'admin'; // Lógica de super-admin más específica


    // Lista de fuentes disponibles para el editor de noticias
    const fontFamilies = [
        'Inter', 'Roboto', 'Merriweather', 'Montserrat', 'Pacifico', 'Lora', 'Open Sans', 'Lato', 'Oswald', 'Playfair Display'
    ];

    // Configuración de módulos para ReactQuill (barra de herramientas)
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            [{ 'color': [] }, { 'background': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
        ],
    };

    // Formatos permitidos por Quill
    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent', 'link', 'image', 'color', 'background',
        'align', 'code-block', 'font', 'size'
    ];


    // --- Funciones de Fetch para Usuarios (SIN CAMBIOS) ---
    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        setUsersError('');
        setUserActionMessage(''); // Limpiar mensajes al recargar
        const token = localStorage.getItem('token');

        if (!token) {
            setUsersError('No estás autenticado para ver la lista de usuarios.');
            setLoadingUsers(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'x-auth-token': token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                const errorData = await response.json();
                setUsersError(errorData.message || 'Error al cargar usuarios.');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setUsersError('Error de conexión al servidor al cargar usuarios.');
        } finally {
            setLoadingUsers(false);
        }
    }, [API_BASE_URL]);

    // Función para otorgar rol de administrador (SIN CAMBIOS)
    const handleGrantAdmin = async (usernameToUpdate) => {
        setUserActionMessage('');

        const token = localStorage.getItem('token');
        if (!token) {
            setUserActionMessage({ type: 'error', message: 'Error: No estás autenticado para realizar esta acción.' });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/grant-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ usernameToUpdate }),
            });

            const data = await response.json();

            if (response.ok) {
                setUserActionMessage({ type: 'success', message: data.message });
                fetchUsers(); // Volver a cargar los usuarios para reflejar el cambio de rol
            } else {
                setUserActionMessage({ type: 'error', message: data.message || 'Error al actualizar el rol del usuario.' });
            }
        } catch (err) {
            console.error('Error de red o del servidor:', err);
            setUserActionMessage({ type: 'error', message: 'No se pudo conectar con el servidor para actualizar el rol.' });
        } finally {
            setTimeout(() => setUserActionMessage(''), 5000);
        }
    };

    // Función: Revocar rol de administrador (SIN CAMBIOS)
    const handleRevokeAdmin = async (usernameToUpdate) => {
        setUserActionMessage('');

        const token = localStorage.getItem('token');
        if (!token) {
            setUserActionMessage({ type: 'error', message: 'Error: No estás autenticado para realizar esta acción.' });
            return;
        }

        if (!window.confirm(`¿Estás seguro de que quieres revocar el rol de administrador a ${usernameToUpdate}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/revoke-admin`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ usernameToUpdate }),
            });

            const data = await response.json();

            if (response.ok) {
                setUserActionMessage({ type: 'success', message: data.message });
                fetchUsers(); // Volver a cargar los usuarios para reflejar el cambio de rol
            } else {
                setUserActionMessage({ type: 'error', message: data.message || 'Error al revocar el rol de administrador.' });
            }
        } catch (err) {
            console.error('Error de red o del servidor al revocar admin:', err);
            setUserActionMessage({ type: 'error', message: 'No se pudo conectar con el servidor para revocar el rol.' });
        } finally {
            setTimeout(() => setUserActionMessage(''), 5000);
        }
    };

    // Función: Eliminar usuario (SIN CAMBIOS)
    const handleDeleteUser = async (userIdToDelete, usernameToDelete) => {
        setUserActionMessage('');

        const token = localStorage.getItem('token');
        if (!token) {
            setUserActionMessage({ type: 'error', message: 'Error: No estás autenticado para realizar esta acción.' });
            return;
        }

        if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${usernameToDelete}? Esta acción es irreversible.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setUserActionMessage({ type: 'success', message: data.message });
                fetchUsers(); // Volver a cargar los usuarios para reflejar la eliminación
            } else {
                setUserActionMessage({ type: 'error', message: data.message || 'Error al eliminar el usuario.' });
            }
        } catch (err) {
            console.error('Error de red o del servidor al eliminar usuario:', err);
            setUserActionMessage({ type: 'error', message: 'No se pudo conectar con el servidor para eliminar el usuario.' });
        } finally {
            setTimeout(() => setUserActionMessage(''), 5000);
        }
    };


    // --- Funciones de Fetch para Mensajes de Contacto (CORREGIDAS LAS RUTAS) ---
    const fetchContactMessages = useCallback(async () => {
        setLoadingContactMessages(true);
        setContactMessagesError('');
        setContactMessageActionMessage(''); // Limpiar mensajes al recargar
        const token = localStorage.getItem('token');

        if (!token) {
            setContactMessagesError('No estás autenticado para ver los mensajes de contacto.');
            setLoadingContactMessages(false);
            return;
        }

        try {
            // RUTA CORREGIDA: Ahora apunta a /api/admin/contactmessages
            const response = await fetch(`${API_BASE_URL}/admin/contactmessages`, {
                headers: {
                    'x-auth-token': token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setContactMessages(data);
            } else {
                const errorData = await response.json();
                setContactMessagesError(errorData.message || 'Error al cargar los mensajes de contacto.');
            }
        } catch (err) {
            console.error('Error fetching contact messages:', err);
            setContactMessagesError('Error de conexión al servidor al cargar mensajes de contacto.');
        } finally {
            setLoadingContactMessages(false);
        }
    }, [API_BASE_URL]);

    // Función para eliminar un mensaje de contacto (CORREGIDA LA RUTA)
    const handleDeleteContactMessage = async (messageId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este mensaje de contacto?')) {
            return;
        }
        setContactMessageActionMessage('');
        const token = localStorage.getItem('token');
        if (!token) {
            setContactMessageActionMessage({ type: 'error', message: 'No estás autenticado para eliminar mensajes.' });
            return;
        }
        try {
            // RUTA CORREGIDA: Ahora apunta a /api/admin/contactmessages/:id
            const response = await fetch(`${API_BASE_URL}/admin/contactmessages/${messageId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token },
            });
            const data = await response.json();
            if (response.ok) {
                setContactMessageActionMessage({ type: 'success', message: data.message });
                fetchContactMessages(); // Volver a cargar los mensajes
            } else {
                setContactMessageActionMessage({ type: 'error', message: data.message || 'Error al eliminar mensaje.' });
            }
        } catch (err) {
            console.error('Error deleting contact message:', err);
            setContactMessageActionMessage({ type: 'error', message: 'Error de conexión al servidor al eliminar mensaje.' });
        } finally {
            setTimeout(() => setContactMessageActionMessage(''), 5000);
        }
    };


    // --- Funciones de Fetch para Publicaciones de Noticias (SIN CAMBIOS RELEVANTES AQUÍ) ---
    const fetchNewsPosts = useCallback(async () => {
        setLoadingNews(true);
        setNewsError('');
        setNewsActionMessage(''); // Limpiar mensajes al recargar
        try {
            const response = await fetch(`${API_BASE_URL}/news`); // Ruta pública para ver noticias
            if (response.ok) {
                const data = await response.json();
                setNewsPosts(data);
            } else {
                const errorData = await response.json();
                setNewsError(errorData.message || 'Error al cargar noticias.');
            }
        } catch (err) {
            console.error('Error fetching news posts:', err);
            setNewsError('Error de conexión al servidor al cargar noticias.');
        } finally {
            setLoadingNews(false);
        }
    }, [API_BASE_URL]);

    // Función para crear una nueva publicación de noticias (SIN CAMBIOS RELEVANTES AQUÍ)
    const handleCreateNewsPost = async (e) => {
        e.preventDefault();
        setNewsActionMessage('');
        if (!newPostTitle || newPostContent.trim() === '' || !newPostFontFamily || !newPostImageUrl) {
            setNewsActionMessage({ type: 'error', message: 'El título, el contenido, la fuente y la URL de la imagen son obligatorios.' });
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            setNewsActionMessage({ type: 'error', message: 'No estás autenticado para crear publicaciones.' });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/admin/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ title: newPostTitle, content: newPostContent, fontFamily: newPostFontFamily, imageUrl: newPostImageUrl }),
            });
            const data = await response.json();
            if (response.ok) {
                setNewsActionMessage({ type: 'success', message: data.message });
                setNewPostTitle('');
                setNewPostContent('');
                setNewPostImageUrl('');
                setNewPostFontFamily('Inter'); // Resetear a la fuente por defecto
                setImagePreview(''); // Limpiar la previsualización
                fetchNewsPosts(); // Volver a cargar las noticias
            } else {
                setNewsActionMessage({ type: 'error', message: data.message || 'Error al crear publicación.' });
            }
        } catch (err) {
            console.error('Error creating news post:', err);
            setNewsActionMessage({ type: 'error', message: 'Error de conexión al servidor al crear publicación.' });
        } finally {
            setTimeout(() => setNewsActionMessage(''), 5000);
        }
    };

    // Función para actualizar una publicación de noticias (SIN CAMBIOS RELEVANTES AQUÍ)
    const handleUpdateNewsPost = async (e) => {
        e.preventDefault();
        setNewsActionMessage('');
        if (!newPostTitle || newPostContent.trim() === '' || !newPostFontFamily || !newPostImageUrl) {
            setNewsActionMessage({ type: 'error', message: 'El título, el contenido, la fuente y la URL de la imagen son obligatorios.' });
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            setNewsActionMessage({ type: 'error', message: 'No estás autenticado para actualizar publicaciones.' });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/admin/news/${editingPostId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    title: newPostTitle,
                    content: newPostContent,
                    fontFamily: newPostFontFamily,
                    imageUrl: newPostImageUrl
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setNewsActionMessage({ type: 'success', message: data.message });
                // Limpiar formulario y salir del modo edición
                setNewPostTitle('');
                setNewPostContent('');
                setNewPostImageUrl('');
                setNewPostFontFamily('Inter');
                setImagePreview('');
                setIsEditing(false);
                setEditingPostId(null);
                fetchNewsPosts();
            } else {
                setNewsActionMessage({ type: 'error', message: data.message || 'Error al actualizar publicación.' });
            }
        } catch (err) {
            console.error('Error updating news post:', err);
            setNewsActionMessage({ type: 'error', message: 'Error de conexión al servidor al actualizar publicación.' });
        } finally {
            setTimeout(() => setNewsActionMessage(''), 5000);
        }
    };


    // Función para eliminar una publicación de noticias (SIN CAMBIOS RELEVANTES AQUÍ)
    const handleDeleteNewsPost = async (postId, postTitle) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar la publicación "${postTitle}"?`)) {
            return;
        }
        setNewsActionMessage('');
        const token = localStorage.getItem('token');
        if (!token) {
            setNewsActionMessage({ type: 'error', message: 'No estás autenticado para eliminar publicaciones.' });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/admin/news/${postId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token },
            });
            const data = await response.json();
            if (response.ok) {
                setNewsActionMessage({ type: 'success', message: data.message });
                fetchNewsPosts(); // Volver a cargar las noticias
            } else {
                setNewsActionMessage({ type: 'error', message: data.message || 'Error al eliminar publicación.' });
            }
        } catch (err) {
            console.error('Error deleting news post:', err);
            setNewsActionMessage({ type: 'error', message: 'Error de conexión al servidor al eliminar publicación.' });
        } finally {
            setTimeout(() => setNewsActionMessage(''), 5000);
        }
    };

    // Función para iniciar la edición de una noticia (SIN CAMBIOS RELEVANTES AQUÍ)
    const handleEditNewsPost = (post) => {
        setIsEditing(true);
        setEditingPostId(post._id);
        setNewPostTitle(post.title);
        setNewPostContent(post.content);
        setNewPostFontFamily(post.fontFamily);
        setNewPostImageUrl(post.imageUrl);
        setImagePreview(post.imageUrl); // Para mostrar la imagen actual en el preview
        setNewsActionMessage(''); // Limpiar mensajes de éxito/error anteriores
    };

    // Función para cancelar la edición (SIN CAMBIOS RELEVANTES AQUÍ)
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingPostId(null);
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostFontFamily('Inter');
        setNewPostImageUrl('');
        setImagePreview('');
        setNewsActionMessage('');
    };

    // Manejo de Subida de Archivos de Imagen (SIN CAMBIOS RELEVANTES AQUÍ)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setNewsActionMessage(''); // Limpiar mensajes de error/éxito

        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                setNewsActionMessage({ type: 'error', message: 'Por favor, selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.).' });
                setNewPostImageUrl('');
                setImagePreview('');
                return;
            }

            // Validar tamaño del archivo (ej. máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5 MB
            if (file.size > maxSize) {
                setNewsActionMessage({ type: 'error', message: 'Límite excedido, la imagen pesa demasiado (máx. 5MB).' });
                setNewPostImageUrl('');
                setImagePreview('');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPostImageUrl(reader.result); // Guarda el Base64
                setImagePreview(reader.result); // Para la previsualización
                setNewsActionMessage(''); // Asegurarse de limpiar si todo fue bien
            };
            reader.onerror = () => {
                setNewsActionMessage({ type: 'error', message: 'Error al leer el archivo. Intenta de nuevo.' });
                setNewPostImageUrl('');
                setImagePreview('');
            };
            reader.readAsDataURL(file); // Lee el archivo como URL de datos (Base64)
        } else {
            setNewPostImageUrl('');
            setImagePreview('');
            setNewsActionMessage(''); // También limpiar si no se selecciona ningún archivo
        }
    };


    // --- Funciones de Fetch para Quejas y Sugerencias (CORREGIDAS LAS RUTAS Y LÓGICA DE RESPUESTA) ---
    const fetchComplaintsSuggestions = useCallback(async () => {
        setLoadingComplaintsSuggestions(true);
        setComplaintsSuggestionsError('');
        setComplaintActionMessage(''); // Limpiar mensajes al recargar
        const token = localStorage.getItem('token');

        if (!token) {
            setComplaintsSuggestionsError('No estás autenticado para ver las quejas y sugerencias.');
            setLoadingComplaintsSuggestions(false);
            return;
        }

        try {
            // RUTA CORREGIDA: Ahora apunta a /api/admin/complaints-suggestions
            const response = await fetch(`${API_BASE_URL}/admin/complaints-suggestions`, {
                headers: {
                    'x-auth-token': token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setComplaintsSuggestions(data);
            } else {
                const errorData = await response.json();
                setComplaintsSuggestionsError(errorData.message || 'Error al cargar quejas y sugerencias.');
            }
        } catch (err) {
            console.error('Error fetching complaints/suggestions:', err);
            setComplaintsSuggestionsError('Error de conexión al servidor al cargar quejas y sugerencias.');
        } finally {
            setLoadingComplaintsSuggestions(false);
        }
    }, [API_BASE_URL]);

    // Función para iniciar la respuesta a una queja/sugerencia
    const handleStartReply = (complaintId) => {
        setSelectedComplaintId(complaintId);
        setReplyMessage(''); // Limpiar el mensaje anterior
        setComplaintActionMessage('');
    };

    // Función para enviar la respuesta a una queja/sugerencia
    const handleSubmitReply = async (complaintId) => {
        if (!replyMessage.trim()) {
            setComplaintActionMessage({ type: 'error', message: 'El mensaje de respuesta es obligatorio.' });
            return;
        }
        setComplaintActionMessage('');
        const token = localStorage.getItem('token');
        if (!token) {
            setComplaintActionMessage({ type: 'error', message: 'No estás autenticado para responder.' });
            return;
        }
        try {
            // RUTA CORREGIDA: Ahora apunta a /api/admin/complaints-suggestions/:id/reply
            const response = await fetch(`${API_BASE_URL}/admin/complaints-suggestions/${complaintId}/reply`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ replyMessage }),
            });
            const data = await response.json();
            if (response.ok) {
                setComplaintActionMessage({ type: 'success', message: data.message });
                setSelectedComplaintId(null); // Cerrar el formulario de respuesta
                setReplyMessage('');
                fetchComplaintsSuggestions(); // Volver a cargar para actualizar el estado
            } else {
                setComplaintActionMessage({ type: 'error', message: data.message || 'Error al enviar respuesta.' });
            }
        } catch (err) {
            console.error('Error submitting reply:', err);
            setComplaintActionMessage({ type: 'error', message: 'Error de conexión al servidor al enviar respuesta.' });
        } finally {
            setTimeout(() => setComplaintActionMessage(''), 5000);
        }
    };

    // Función para eliminar una queja/sugerencia
    const handleDeleteComplaintSuggestion = async (itemId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta queja/sugerencia?')) {
            return;
        }
        setComplaintActionMessage('');
        const token = localStorage.getItem('token');
        if (!token) {
            setComplaintActionMessage({ type: 'error', message: 'No estás autenticado para eliminar.' });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/admin/complaints-suggestions/${itemId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token },
            });
            const data = await response.json();
            if (response.ok) {
                setComplaintActionMessage({ type: 'success', message: data.message });
                fetchComplaintsSuggestions(); // Volver a cargar para actualizar la lista
            } else {
                setComplaintActionMessage({ type: 'error', message: data.message || 'Error al eliminar.' });
            }
        } catch (err) {
            console.error('Error deleting complaint/suggestion:', err);
            setComplaintActionMessage({ type: 'error', message: 'Error de conexión al servidor al eliminar.' });
        } finally {
            setTimeout(() => setComplaintActionMessage(''), 5000);
        }
    };


    // Efecto para cargar todos los datos al montar el componente
    useEffect(() => {
        fetchUsers();
        fetchContactMessages();
        fetchNewsPosts();
        fetchComplaintsSuggestions(); // Añadir la carga de quejas/sugerencias
    }, [fetchUsers, fetchContactMessages, fetchNewsPosts, fetchComplaintsSuggestions]);


    return (
        <section className="admin-panel-section">
            <div className="container admin-panel-container">
                <h2 className="admin-panel-title">Panel de Administración</h2>
                <p className="text-center text-gray-700 mb-6">Bienvenido, <span className="font-semibold text-indigo-600">{username}</span> (<span className="font-semibold text-purple-700">{userRole}</span>)</p>

                <div className="admin-panel-tabs">
                    <button
                        className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Usuarios
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'contactMessages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contactMessages')}
                    >
                        Mensajes de Contacto
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
                        onClick={() => setActiveTab('news')}
                    >
                        Noticias
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'complaintsSuggestions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('complaintsSuggestions')}
                    >
                        Quejas/Sugerencias
                    </button>
                </div>

                <div className="admin-panel-content">
                    {activeTab === 'users' && (
                        <div className="admin-section grant-admin-section">
                            <h3 className="section-title">Gestionar Usuarios y Roles</h3>
                            <p className="section-description">
                                Solo el super-administrador puede otorgar y revocar roles de administrador, y eliminar usuarios.
                            </p>

                            {userActionMessage && (
                                <p className={`submission-status ${userActionMessage.type}`}>
                                    {userActionMessage.message}
                                </p>
                            )}

                            {loadingUsers ? (
                                <p className="loading-message">Cargando usuarios...</p>
                            ) : usersError ? (
                                <p className="error-message">{usersError}</p>
                            ) : (
                                <div className="users-list">
                                    {users.map((user) => (
                                        <div key={user._id} className="user-card">
                                            <div className="user-info">
                                                <p className="user-username">Usuario: {user.username}</p>
                                                <p className={`user-role ${user.role === 'admin' ? 'user-role-admin' : ''} ${user.role === 'super-admin' ? 'user-role-super-admin' : ''}`}>
                                                    Rol: {user.role === 'super-admin' ? 'Super-Administrador' : (user.role === 'admin' ? 'Administrador' : 'Usuario Normal')}
                                                </p>
                                            </div>
                                            <div className="user-actions">
                                                {/* Botón para Otorgar Admin */}
                                                {isSuperAdmin && user.role === 'user' && (
                                                    <button
                                                        onClick={() => handleGrantAdmin(user.username)}
                                                        className="admin-action-button grant-button"
                                                    >
                                                        Convertir en Admin
                                                    </button>
                                                )}
                                                {/* Botón para Revocar Admin */}
                                                {isSuperAdmin && user.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleRevokeAdmin(user.username)}
                                                        className="admin-action-button revoke-button"
                                                    >
                                                        Revocar Admin
                                                    </button>
                                                )}
                                                {/* Botón para Eliminar Usuario */}
                                                {isSuperAdmin && user.username !== loggedInUsername && user.role !== 'super-admin' && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id, user.username)}
                                                        className="admin-action-button delete-button"
                                                    >
                                                        Eliminar Usuario
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'contactMessages' && (
                        <div className="admin-section messages-section">
                            <h3 className="section-title">Mensajes de Contacto Recibidos</h3>
                            {contactMessageActionMessage && (
                                <p className={`submission-status ${contactMessageActionMessage.type}`}>
                                    {contactMessageActionMessage.message}
                                </p>
                            )}
                            {loadingContactMessages ? (
                                <p className="loading-message">Cargando mensajes de contacto...</p>
                            ) : contactMessagesError ? (
                                <p className="error-message">{contactMessagesError}</p>
                            ) : (
                                contactMessages.length > 0 ? (
                                    <div className="messages-list">
                                        {contactMessages.map((msg) => (
                                            <div key={msg._id} className="message-card">
                                                <span className="message-icon">✉️</span>
                                                <p className="message-header">
                                                    <span className="message-name">{msg.name}</span>
                                                </p>
                                                <p className="message-email">Email: {msg.email}</p>
                                                <p className="message-body-label">Mensaje:</p>
                                                <div className="message-content">
                                                    {msg.message}
                                                </div>
                                                <p className="message-timestamp">Recibido: {new Date(msg.createdAt).toLocaleString()}</p>
                                                {isSuperAdmin && ( // Solo super-admin puede eliminar mensajes de contacto
                                                    <div className="message-actions">
                                                        <button
                                                            onClick={() => handleDeleteContactMessage(msg._id)}
                                                            className="admin-action-button delete-button"
                                                        >
                                                            Eliminar Mensaje
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-messages-message">No hay mensajes de contacto aún.</p>
                                )
                            )}
                        </div>
                    )}

                    {activeTab === 'news' && (
                        <>
                            {/* Sección para Crear Publicaciones de Noticias */}
                            <div className="admin-section create-news-section">
                                <h3 className="section-title">
                                    {isEditing ? 'Editar Publicación de Noticias' : 'Crear Nueva Publicación de Noticias'}
                                </h3>
                                <p className="section-description">
                                    {isEditing ? 'Modifica los detalles de la noticia seleccionada.' : 'Crea un nuevo artículo o anuncio para tu sitio web.'}
                                </p>
                                {newsActionMessage && newsActionMessage.type && (
                                    <p className={`submission-status ${newsActionMessage.type}`}>
                                        {newsActionMessage.message}
                                    </p>
                                )}
                                <form onSubmit={isEditing ? handleUpdateNewsPost : handleCreateNewsPost} className="news-post-form">
                                    <div className="form-group">
                                        <label htmlFor="newPostTitle" className="form-label">Título:</label>
                                        <input
                                            type="text"
                                            id="newPostTitle"
                                            value={newPostTitle}
                                            onChange={(e) => setNewPostTitle(e.target.value)}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="fontFamilySelector" className="form-label">Tipo de Letra del Título:</label>
                                        <select
                                            id="fontFamilySelector"
                                            value={newPostFontFamily}
                                            onChange={(e) => setNewPostFontFamily(e.target.value)}
                                            className="form-input"
                                        >
                                            {fontFamilies.map(font => (
                                                <option key={font} value={font} style={{ fontFamily: font }}>
                                                    {font}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="newPostImageUrl" className="form-label">URL de la Imagen (Miniatura):</label>
                                        <input
                                            type="url"
                                            id="newPostImageUrl"
                                            value={newPostImageUrl}
                                            onChange={(e) => { setNewPostImageUrl(e.target.value); setImagePreview(e.target.value); }}
                                            className="form-input"
                                            placeholder="Ej: https://placehold.co/600x400/E0E7FF/4338CA?text=Noticia"
                                        />
                                        <p className="or-separator">O</p>
                                        <label htmlFor="imageUpload" className="form-label">Subir Imagen (Local):</label>
                                        <input
                                            type="file"
                                            id="imageUpload"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="form-input"
                                        />
                                        {imagePreview && (
                                            <div className="image-preview-wrapper mt-2">
                                                <img src={imagePreview} alt="Previsualización" className="image-preview" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x150/CCCCCC/FFFFFF?text=Error'; }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="newPostContent" className="form-label">Contenido:</label>
                                        <ReactQuill
                                            theme="snow"
                                            value={newPostContent}
                                            onChange={setNewPostContent}
                                            modules={modules}
                                            formats={formats}
                                            className="quill-editor-custom"
                                        />
                                    </div>
                                    <button type="submit" className="admin-action-button create-button">
                                        {isEditing ? 'Guardar Cambios' : 'Publicar Noticia'}
                                    </button>
                                    {isEditing && (
                                        <button type="button" onClick={handleCancelEdit} className="admin-action-button delete-button">
                                            Cancelar Edición
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* Sección para Gestionar Publicaciones de Noticias */}
                            <div className="admin-section manage-news-section">
                                <h3 className="section-title">Gestionar Publicaciones de Noticias</h3>
                                {loadingNews ? (
                                    <p className="loading-message">Cargando publicaciones...</p>
                                ) : newsError ? (
                                    <p className="error-message">{newsError}</p>
                                ) : (
                                    newsPosts.length > 0 ? (
                                        <div className="news-posts-list">
                                            {newsPosts.map((post) => (
                                                <div key={post._id} className="news-post-card">
                                                    <h5 className="news-post-title" style={{ fontFamily: post.fontFamily }}>{post.title}</h5>
                                                    <p className="news-post-author">Autor: {post.author}</p>
                                                    <p className="news-post-date">Fecha: {new Date(post.createdAt).toLocaleDateString()}</p>
                                                    <div className="news-post-content-preview" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.substring(0, 100)) + '...' }}></div>
                                                    <div className="news-post-actions">
                                                        <button
                                                            onClick={() => handleEditNewsPost(post)}
                                                            className="admin-action-button edit-button"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteNewsPost(post._id, post.title)}
                                                            className="admin-action-button delete-button"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-messages-message">No hay publicaciones de noticias aún.</p>
                                    )
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'complaintsSuggestions' && (
                        <div className="admin-section complaints-suggestions-section">
                            <h3 className="section-title">Quejas y Sugerencias</h3>
                            {complaintActionMessage && (
                                <p className={`submission-status ${complaintActionMessage.type}`}>
                                    {complaintActionMessage.message}
                                </p>
                            )}
                            {loadingComplaintsSuggestions ? (
                                <p className="loading-message">Cargando quejas y sugerencias...</p>
                            ) : complaintsSuggestionsError ? (
                                <p className="error-message">{complaintsSuggestionsError}</p>
                            ) : (
                                complaintsSuggestions.length > 0 ? (
                                    <div className="complaints-suggestions-list">
                                        {complaintsSuggestions.map((item) => (
                                            <div key={item._id} className="complaint-suggestion-card">
                                                <p className="item-header">
                                                    <span className="item-type">{item.type === 'queja' ? 'Queja' : 'Sugerencia'}:</span>
                                                    <span className="item-name">{item.name}</span>
                                                </p>
                                                <p className="item-email">Email: {item.email}</p>
                                                <p className="item-message-label">Mensaje:</p>
                                                <div className="item-content">{item.message}</div>
                                                <p className={`item-status ${item.status === 'resuelto' ? 'status-resolved' : 'status-pending'}`}>
                                                    Estado: {item.status === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                                                </p>
                                                {item.response && (
                                                    <div className="item-response">
                                                        <p className="item-response-label">Respuesta:</p>
                                                        <div className="item-response-content">{item.response}</div>
                                                    </div>
                                                )}
                                                <p className="item-timestamp">Recibido: {new Date(item.createdAt).toLocaleString()}</p>
                                                {isSuperAdmin && ( // Solo super-admin puede responder y eliminar
                                                    <div className="item-actions">
                                                        {item.status === 'pendiente' && (
                                                            <button
                                                                onClick={() => handleStartReply(item._id)}
                                                                className="admin-action-button reply-button"
                                                            >
                                                                Responder
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteComplaintSuggestion(item._id)}
                                                            className="admin-action-button delete-button"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                                {selectedComplaintId === item._id && (
                                                    <div className="reply-form-container">
                                                        <textarea
                                                            value={replyMessage}
                                                            onChange={(e) => setReplyMessage(e.target.value)}
                                                            placeholder="Escribe tu respuesta aquí..."
                                                            className="form-textarea"
                                                            rows="3"
                                                        ></textarea>
                                                        <button
                                                            onClick={() => handleSubmitReply(item._id)}
                                                            className="admin-action-button submit-reply-button"
                                                        >
                                                            Enviar Respuesta
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedComplaintId(null)}
                                                            className="admin-action-button cancel-button"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-messages-message">No hay quejas o sugerencias aún.</p>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AdminPanel;
