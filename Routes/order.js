const router = require("express").Router()
const Order = require("../Models/Order")
const User = require("../Models/User")
const Cafe = require("../Models/Cafe")
const verify = require('../verifyToken')

function getTimeInSec(time, date) {

    const d = new Date()

    let dateTime = parseInt(date.split('-')[0])
    let monthTime = parseInt(date.split('-')[1]) - 1
    let yearTime = parseInt(date.split('-')[2])
    let hours = parseInt(time.split(':')[0])
    let min = parseInt(time.split(':')[1])
    let sec = parseInt(time.split(':')[2])


    const dateOfOrder = new Date(yearTime, monthTime, dateTime + 1, hours, min, sec);
    const timeInSec = d.setTime(dateOfOrder.getTime())
    return timeInSec


}

router.post('/addOrder', async (req, res) => {

    const today = new Date()

    const user = req.body.user
    const cafe = req.body.cafe
    const transactionId = req.body.transactionId
    const table = req.body.table
    const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
    const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
    const isComplete = req.body.isComplete
    const data = req.body.data
    const discount = req.body.discount
    const totalAmount = req.body.totalAmount

    let newOrder = new Order({
        user,
        cafe,
        table,
        transactionId,
        date,
        time,
        isComplete,
        data,
        discount,
        totalAmount
    })


    newOrder = await newOrder.save()

    try {

        const newUser = await User.findById(user)
        let userOrders = newUser.orders

        const newCafe = await Cafe.findById(cafe)
        let cafeOrders = newCafe.orders

        userOrders.push(newOrder._id)
        cafeOrders.push(newOrder._id)

        let ParentUser = await User.updateOne({ _id: user }, {
            $set: { orders: userOrders }
        })

        let ParentCafe = await Cafe.updateOne({ _id: cafe }, {
            $set: { orders: cafeOrders }
        })


        res.json({ isComplete: false, data: newOrder, orderId: newOrder._id })

    } catch (e) {

        console.log(e)
        res.json(e)

    }

})

router.post('/getCurrentOrders', async (req, res) => {

    const cafe = req.body.cafeId

    let today = new Date()
    let date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
    let currentOrders = []

    const time = today.getHours()

    try {

        const newCafe = await Cafe.findById(cafe)
        const orders = newCafe.orders

        for (let i = 0; i < orders.length; i++) {

            const OrderDetails = await Order.findById(orders[i])

            if (OrderDetails !== null) {

                if (OrderDetails.date === date && !OrderDetails.isComplete) {

                    if (time - 5 < (OrderDetails.time).split(':')[0] <= time) {
                        currentOrders.push({ id: OrderDetails._id, table: OrderDetails.table, time: getTimeInSec(OrderDetails.time, OrderDetails.date), data: OrderDetails.data })
                    }

                }

            }

        }


        res.json(currentOrders)


    } catch (e) { }


})

router.post('/completeOrder', async (req, res) => {

    const orderId = req.body.orderId

    try {

        const newOrder = await Order.findByIdAndUpdate(orderId, { isComplete: true })
        res.json({ msg : "Order Complete" , orderId})

    } catch (e) {
        console.log(e)
    }

})



module.exports = router