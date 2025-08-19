// UNISTYLE PRO-BACKEND/middleware/authorizeSuperAdmin.js
const authorizeSuperAdmin = (req, res, next) => {
    // req.user viene del middleware 'auth' y contiene la información del usuario autenticado
    // Ahora permitimos acceso a usuarios con rol 'admin' o 'super-admin'
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super-admin')) {
        next(); // El usuario es admin o super-admin, permite que la solicitud continúe
    } else {
        // Si el usuario no es admin ni super-admin, envía un error 403 (Prohibido)
        res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden realizar esta acción.' });
    }
};

module.exports = authorizeSuperAdmin;
