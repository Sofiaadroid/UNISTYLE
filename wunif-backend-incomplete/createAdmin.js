// Script para crear un usuario admin en la base de datos

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const username = 'admin';
    const password = 'admin123'; // Cambia esta contraseña después de iniciar sesión
    const role = 'admin';

    const exists = await User.findOne({ username });
    if (exists) {
        console.log('El usuario admin ya existe.');
        process.exit(0);
    }

    const admin = new User({ username, password, role });
    await admin.save();
    console.log('Usuario admin creado con éxito.');
    process.exit(0);
}

createAdmin().catch(err => {
    console.error('Error al crear el usuario admin:', err);
    process.exit(1);
});
