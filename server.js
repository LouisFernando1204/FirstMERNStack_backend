require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);

connectDB();

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'));

app.use('/users', require('./routes/userRoutes'));
app.use('/notes', require('./routes/noteRoutes'))

app.all('*', (req, res) => {
    res.status(404);

    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: "404 Not Found" });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

// err.name:
// Menyediakan nama error yang terjadi, seperti 'MongoNetworkError', 'MongooseServerSelectionError', dll.
// Contoh: 'MongoNetworkError'.

// err.message:
// Menyediakan deskripsi atau pesan kesalahan yang lebih rinci.
// Contoh: 'failed to connect to server [localhost:27017] on first connect [MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017]'.

// err.code:
// Kode numerik yang mewakili jenis kesalahan.
// Misalnya, 11000 untuk error duplikat, 18 untuk otentikasi gagal, dll.
// Jika error tidak memiliki code, nilainya bisa undefined.

// err.errno:
// Nomor kesalahan yang disertakan oleh sistem operasi atau driver MongoDB. Kadang-kadang sama dengan code.
// Contoh: -61, 11000.

// err.syscall:
// Nama sistem panggilan (syscall) yang menyebabkan kesalahan.
// Contoh: 'connect'.

// err.hostname:
// Hostname dari server yang menyebabkan kesalahan, jika ada.
// Contoh: 'localhost'.

// err.path:
// Path atau properti yang menyebabkan error, misalnya ketika terjadi kesalahan validasi.
// Contoh: 'email' ketika terjadi error validasi pada field email.

// err.stack:
// Stack trace dari error yang memberikan informasi di mana dan bagaimana error tersebut terjadi.
// Ini berguna untuk debugging dan pelacakan kesalahan yang lebih mendetail.

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.errno}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})