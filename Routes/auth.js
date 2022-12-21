const auth = require("express").Router()
const User = require("../Models/User")
const CryptoJS = require("crypto-js")
const crypto = require('crypto') //For Hashing
const dotenv = require("dotenv")
dotenv.config()
const jwt = require('jsonwebtoken')
var nodemailer = require('nodemailer');
const { create } = require("../Models/User")
const verify = require('../verifyToken')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bhaveshanandpara12@gmail.com',
        pass: 'mbopuokvzssshhta'
    }
});

function createHash(data) {

    return crypto.createHmac('sha256', process.env.SECRET_KEY).update(data).digest('hex') //Hashing of Data

}


auth.post('/register', async (req, res) => {

    //declaring credentials
    const fullName = req.body.name
    const email = req.body.email

    const checkUser = await User.findOne({ email })

    if (checkUser) {
        res.status(403).json({ msg: "Email Alredy Registered" })
    }
    else {


        const OTP = Math.floor(Math.random() * 10000)  //4 Digit OTP
        const timeLimit = 2 * 60 * 1000 // 2mins in milliseconds
        const expires = Date.now() + timeLimit


        console.log({ email, fullName, OTP, expires });

        const data = `${email}.${fullName}.${OTP}.${expires}` //Hash Data for JWT
        const hash = createHash(data)

        const fullHash = `${hash}.${expires}`

        var mailOptions = {
            from: 'bhaveshanandpara12@gmail.com',
            to: email,
            subject: 'OTP for Verification at Cafe Managment System',
            text: `your OTP is ${OTP}`
        };

        try {

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.send('error') // if error occurs send error as response to client
                }
                else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.json({ msg: "OTP Send Successfully", OTP, fullHash })

        } catch (e) {
            console.log(e);
            res.json("Error Occured")
        }
    }

})

auth.post('/login', async (req, res) => {

    //Decrlaring credentials
    const email = req.body.email
    const password = req.body.password

    try {

        let user = await User.findOne({ email })//Find User in Database by PhoneNo 

        try {

            var bytes = CryptoJS.AES.decrypt(user.userPassword, process.env.SECRET_KEY); //Decrypt the Encrypted Password
            var originalPass = bytes.toString(CryptoJS.enc.Utf8); //Original Password

            originalPass !== password &&
                res.status(401).json({ msg: "Invalid Password" })

            const accessToken = jwt.sign({ data: { email, name: user.name } }, process.env.SECRET_KEY, { expiresIn: '1d' })
            console.log("New AccessToken " + accessToken);

            let theUser = await User.findOneAndUpdate({ email }, { accessToken }, { new: true })
            res.status(200).json({ accessToken, data: { theUser }, isAuthenticated: true })


        } catch (err) {
            console.log(err);
            res.status(403).json({ msg: "Invalid Email" })
        }



    } catch (err) {
        console.log(err)
    }

})

auth.post('/verifyOTP', async (req, res) => {

    try {

        const email = req.body.email
        const fullName = req.body.fullName
        const hash = req.body.hash
        const OTP = req.body.otp
        let [hashValue, expires] = hash.split('.') //Taking the hash and Breaking it into hashValue and Exprixy

        let now = Date.now()

        if (now > parseInt(expires)) {
            return res.status(504).send({ msg: ' TimeOut' })  //IF Expired after 2 min
        }

        const data = `${email}.${fullName}.${OTP}.${expires}` //Hash for JWT

        const newCalculatedHash = createHash(data)

        console.log({ email, fullName, OTP, expires });


        if (newCalculatedHash === hashValue) {

            //If Newly created hash and hash provided by user is same

            const timeLimit = 15 * 60 * 1000 // 15mins in milliseconds
            const expires = Date.now() + timeLimit
            let newData = `${email}?${fullName}` //Hash for JWT

            let hash = CryptoJS.AES.encrypt(newData, process.env.SECRET_KEY).toString()//Encryptes Password
            hash = `${hash}.${expires}`

            res.status(202).send({ msg: "OTP Verified", hash })
        }

        else {
            res.json({ msg: "Invalid OTP" })
        }

    } catch (err) {
        console.log(err)
    }

})

auth.post('/resetPassword', async (req, res) => {

    const hash = req.body.newHash
    const password = req.body.password


    let [hashValue, expires] = hash.split('.')

    let now = Date.now()

    if (now > parseInt(expires)) {
        res.status(404).json({ msg: "Timeout" })
    }

    let data = CryptoJS.AES.decrypt(hashValue, process.env.SECRET_KEY); //Decrypt the Encrypted Password
    data = data.toString(CryptoJS.enc.Utf8);

    let email = data.split('?')[0]
    let fullName = data.split('?')[1]

    const accessToken = jwt.sign({ data: { email, name: fullName } }, process.env.SECRET_KEY, { expiresIn: '1d' })

    try {

        const newUser = new User({
            userName: fullName,
            email: email,
            userPassword: CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString(), //Encryptes Password,
            accessToken: accessToken
        })

        const user = await newUser.save()

        res.status(201).json({ msg: "user Created" })

    } catch (e) {
        res.json({ msg: "Error Ocurred" })
    }


    // const fullHash = `${hash}.${expires}` //hash with Expiry


    // res.status(200).send({ phoneNo, hash: fullHash, password, OTP })

})


module.exports = auth