const mongoose = require('mongoose');
//  Ini menginisialisasi plugin mongoose-sequence dengan instance Mongoose Anda.
const AutoIncrement = require('mongoose-sequence')(mongoose)

const noteSchema = new mongoose.Schema(
    {
        // mongoose.Schema.Types.ObjectId digunakan untuk menyimpan ID unik (ObjectId) dari dokumen lain. Ini memungkinkan satu dokumen untuk merujuk ke dokumen lain melalui ID-nya.
        // ref digunakan untuk membuat referensi antar model di Mongoose. Dengan ref, Anda dapat memanfaatkan metode populate() untuk mengisi informasi terkait dari dokumen lain, sehingga mempermudah manipulasi dan akses data.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timeStamps: true
    }
);

// Ini mengaktifkan plugin auto-increment pada skema noteSchema.
noteSchema.plugin(AutoIncrement, {
    // Menentukan nama field yang akan diberi nilai auto-increment, yaitu ticket. Setiap kali dokumen Note baru dibuat, nilai ticket akan bertambah satu dari nilai sebelumnya.
    // field ticket akan berada pada collections Note setiap note dibuat
    inc_field: 'ticket',
    // Nama id ini digunakan oleh plugin untuk menyimpan nilai counter saat ini. Secara internal, plugin akan membuat koleksi baru di MongoDB dengan nama ticketNums untuk melacak nilai terbaru dari ticket.
    id: 'ticketNums',
    // Ini menentukan nilai awal (sekuens mulai) dari auto-increment. Dalam hal ini, nomor ticket akan dimulai dari 500 dan akan bertambah secara berurutan (500, 501, 502, ...).
    start_seq: 500
})

module.exports = mongoose.model('Note', noteSchema);