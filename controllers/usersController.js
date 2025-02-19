const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// asyncHandler adalah middleware yang digunakan untuk menangani fungsi asinkron dalam Express. 
// Dalam Express.js, ketika Anda menggunakan fungsi asinkron dengan async/await, Anda harus menangani kesalahan secara manual dengan blok try-catch. 
// express-async-handler adalah paket yang mempermudah penanganan kesalahan asinkron tersebut tanpa perlu menulis blok try-catch berulang kali. Jika ada kesalahan dalam fungsi asinkron, asyncHandler akan menangkap kesalahan tersebut dan meneruskannya ke middleware penanganan kesalahan Express.
// middleware penanganan keslaahan error itu yang ada 4 parameter (err, req, res, next)

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    // CARA KERJA select():
    // Menyertakan Field: Jika Anda hanya ingin menyertakan beberapa field dari dokumen, Anda dapat menyebutkan nama field yang diinginkan.
    // Mengecualikan Field: Jika Anda ingin mengecualikan beberapa field (misalnya, password), Anda dapat menggunakan tanda minus (-) sebelum nama field.
    //  Mengubah hasil query menjadi objek JavaScript biasa, meningkatkan performa dan mengurangi penggunaan memori jika Anda tidak memerlukan fitur Mongoose.
    const users = await User.find().select('-password').lean()
    // console.log(users);

    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body

    // Confirm data
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPwd }
        : { username, "password": hashedPwd, roles }

    // Create and store new user 
    const user = await User.create(userObject)

    if (user) { //created 
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
})

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body

    // Confirm data 
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate 
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow updates to the original user 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username
    user.roles = roles
    user.active = active

    // password bersifat opsional
    if (password) {
        // Hash password 
        user.password = await bcrypt.hash(password, 10) // salt rounds 
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Does the user still have assigned notes?
    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()
    // console.log(result);

    const reply = `Username ${user.username} with ID ${user._id} deleted`;

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}