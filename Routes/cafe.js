const cafe = require("express").Router()
const Cafe = require("../Models/Cafe")
const User = require("../Models/User")
const verify = require('../verifyToken')
const multer = require('multer')

const storage = multer.diskStorage({ // notice you are calling the multer.diskStorage() method here, not multer()
    destination: function (req, file, cb) {
        cb(null, '../cafe/public/Media/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage })


cafe.post('/registerCafe', upload.single('image'), async (req, res) => {

    const data = JSON.parse(req.body.data)

    const cafeName = data.cafeName
    const subtitle = data.subtitle
    const address = data.address
    const city = data.city
    const profileImg = req.file
    let owner = data.owner

    try {

        let cafeOwner = await User.findOne({ userName: owner })

        const newCafe = new Cafe({
            cafeName,
            subtitle,
            address,
            city,
            profileImg: profileImg.path,
            owner: cafeOwner._id
        })

        const cafe = await newCafe.save()

        try {

            let cafes = cafeOwner.cafes
            console.log(cafes)
            cafes.push(cafe._id)
            console.log(cafes)

            cafeOwner.updateOne({ $set: { cafes: cafes } })
            cafeOwner.save()

        } catch (e) {
            console.log(e)
            return res.json('Cafe did not add to User')
        }

        res.json(newCafe)

    } catch (e) {
        console.log(e);
        res.json("Cafe Did not added")
    }


})

cafe.get('/getCafeDetails', async (req, res) => {

    const id = req.query.id
    const table = req.query.table
    console.log(id)

    try {

        const cafe = await Cafe.findById(id);

        if (cafe === null) {
            throw new Error()
        }

        res.json(cafe)

    } catch (e) {
        console.log(e);
        res.json("Cafe does not exist")
    }

})

cafe.post('/getCafes', async (req, res) => {

    const city = req.body.city

    try {
        const cafes = await Cafe.find({ city });
        res.json(cafes)

    } catch (e) {
        console.log(e);
        res.json("Cafe does not exist")
    }

})


cafe.post('/updateRating', async (req, res) => {

    const ratedata = req.body.data

    console.log(ratedata)

    data.forEach(async (element) => {

        const newCafe = Cafe.findById(element.id)
        let avgRating = newCafe.rating ? newCafe.rating : 0

        await Cafe.updateOne({ _id: element.id }, { $set: { rating: parseFloat(avgRating + element.rating) / parseFloat(2) } })

        res.json('Update Completede')

    });

})

module.exports = cafe