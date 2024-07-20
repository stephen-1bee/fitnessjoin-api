const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt')
const superAdminSchema = require('../models/superAdminSchema')

// create super admin
router.post('/create', async(req, res) => {
    try{
        // taking creds
        const { first_name, last_name, email, phone, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10)

        // new super admin
        const newSuperAdmin = new superAdminSchema({
            first_name,
            last_name,
            email,
            phone, 
            password: hashedPassword
        })

        // query
        const addSuperAdmin = await newSuperAdmin.save()

        if(addSuperAdmin){
            res.json({msg: 'super admin added successfully', super_admin: addSuperAdmin})
        }
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'internal server error'})
    }
})

// get all super admins
router.get('/all', async(req, res) => {
    try{
        // query
        const allSuperAdmins = await superAdminSchema.find()
        if(allSuperAdmins){
            res.json({msg: 'success', super_admin_count: allSuperAdmins.length, superadmins: allSuperAdmins})
        }
    }catch(err){
        console.log(err)
        res.status(500).json({msg: 'internal server error'})
    }
})

// login with email and password with bcrypt check against password
router.post('/login', async(req, res) => {
    try{
        // taking creds
        const { email, password } = req.body;

        // checking if user exists
        const user = await superAdminSchema.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // checking if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // returning user
        res.json({msg: 'login successful', user});
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Internal server error'
        })
    }
})

module.exports = router