const menu = require("express").Router()
const Dish = require('../Models/Dish')
const verify = require('../verifyToken')
const multer = require('multer');
const Cafe = require("../Models/Cafe");
const Order = require('../Models/Order')

const storage = multer.diskStorage({ // notice you are calling the multer.diskStorage() method here, not multer()
    destination: function (req, file, cb) {
        cb(null, '../cafe/public/Media/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage })


const getXDays = (noOfDays = 0) => {

    const d = new Date()
    d.setDate(d.getDate() - noOfDays)
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()

}

const getCorrectDateFormat = (date) => {

    const correctDateFormat = date.split('-')
    return correctDateFormat['2'] + "-" + correctDateFormat['1'] + "-" + correctDateFormat['0']

}


menu.post('/addNewDish', upload.single('image'), async (req, res) => {

    const data = JSON.parse(req.body.data)

    const dishName = data.dishName
    const isVeg = data.isVeg
    const category = data.category
    const price = data.price
    const cafe = data.cafe
    const desc = data.desc
    const profileImg = (req.file.path).split('Media')[1]

    try {

        let cafeDetails = await Cafe.findById(cafe)
        let dish = null

        try {

            dish = await Dish.findOne({ dishName, cafe })

        } catch (e) { }

        if (dish === null) {

            let newDish = new Dish({ dishName, isVeg, desc, category, price, cafe, profileImg })
            newDish = await newDish.save()

            let dishes = cafeDetails.dishes

            dishes.push(newDish._id)

            let parentCafe = await Cafe.updateOne({ _id: cafe }, {
                $set: { dishes: dishes }
            })
            res.json("New Dish Added Succesfully")
        }

        else { return res.json("Dish Already Exists") }



    } catch (e) {

        console.log(e);
        return res.json("Error Occurred while adding the dish")

    }


})

menu.post('/deleteDish', upload.single('image'), async (req, res) => {

    const data = JSON.parse(req.body.data)

    try {


        const dish = await Dish.findById(data.id)
        const cafeId = dish.cafe
        let dishId = dish._id

        const cafe = await Cafe.findById(cafeId)
        let dishes = cafe.dishes

        const index = dishes.indexOf(dishId);
        if (index > -1) { // only splice array when item is found
            dishes.splice(index, 1); // 2nd parameter means remove one item only
        }

        await Cafe.findByIdAndUpdate({ _id: cafeId }, { $set: { dishes: dishes } })

        dish.remove()

        res.json('Dish Deleted Successfully')


    } catch (e) {
        console.log(e);
        res.json("error occured during deleting Dish Item")

    }



})

menu.post('/getDish', async (req, res) => {

    const id = req.body.id
    console.log(id)

    try {

        const dish = await Dish.findById(id)
        res.json(dish)


    } catch (e) {
        console.log(e);
        res.json("error occured during deleting Dish Item")

    }



})

menu.post('/updateRating', async (req, res) => {

    const data = req.body.data

        (data).forEach(async (element) => {

            const newDish = Dish.findById(element.id)
            let avgRating = newDish.avgRating ? newDish.avgRating : 0

            await Dish.updateOne({ _id: element.id }, { $set: { avgRating: parseFloat(avgRating + element.rating) / parseFloat(2) } })

            res.json('Update Completede')

        });

})

menu.post('/getDishDetails', async (req, res) => {


    const cafeId = req.body.cafeId

    const cafe = await Cafe.findById(cafeId)
    const dishesId = cafe.dishes
    const ordersId = cafe.orders

    const dishes = []
    const orders = []

    const dishStats = {}

    const stats = {
        today: [],
        Days15: [],
        Weeks4: [],
        Weeks24: [],
        Weeks52: []
    }

    const MonthlyOrderStats = {}

    for (let i = 0; i < dishesId.length; i++) {
        const newDish = await Dish.findById(dishesId[i])
        dishes.push(newDish)
        dishStats[newDish.dishName] = [{ today: 0 }, { Days15: 0 }, { Weeks4: 0 }, { Weeks24: 0 }, { Weeks52: 0 },]

    }


    for (let i = 0; i < ordersId.length; i++) {
        const newOrder = await Order.findById(ordersId[i])

        try {


            if (JSON.stringify(new Date(getCorrectDateFormat(newOrder.date))) == JSON.stringify(new Date(getXDays()))) {

                stats['today'].push(newOrder)
            }

            if (new Date(getCorrectDateFormat(newOrder.date)) >= new Date(getXDays(15))) {
                stats['Days15'].push(newOrder)
            }

            if (new Date(getCorrectDateFormat(newOrder.date)) >= new Date(getXDays(28))) {
                stats['Weeks4'].push(newOrder)
            }

            if (new Date(getCorrectDateFormat(newOrder.date)) >= new Date(getXDays(168))) {
                stats['Weeks24'].push(newOrder)
            }

            if (new Date(getCorrectDateFormat(newOrder.date)) >= new Date(getXDays(364))) {
                stats['Weeks52'].push(newOrder)
            }


        } catch (e) { }

    }


    for (const key in stats) {

        (stats[key]).forEach((ele) => {
            (ele.data).forEach((dish) => {
                (dishStats[dish.name]).forEach((e) => {
                    for (const dishkey in e) {
                        if (dishkey === key) {
                            e[dishkey] = e[dishkey] + dish.qty
                        }
                    }
                })
            })
        })

    }


    stats['Weeks4'].forEach((ord) => {

        if (MonthlyOrderStats[ord.date]) {
            MonthlyOrderStats[ord.date] = MonthlyOrderStats[ord.date] + 1
        }
        else {
            MonthlyOrderStats[ord.date] = 1
        }

    })

    res.json( { cafeName : cafe.cafeName , dishStats , MonthlyOrderStats } )


})

module.exports = menu