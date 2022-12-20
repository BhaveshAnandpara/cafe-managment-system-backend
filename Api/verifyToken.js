const jwt = require("jsonwebtoken")
// import jwt from 'jsonwebtoken'

function verify(req, res, next) {

    const token = req.headers.token // token = 32424n34324hbhbb45

    if (token) {

        jwt.verify(token, process.env.SECRET_KEY, (err, userInfo) => { //Will take token and Secret KEy and Return Either Error or The Authenticated info
            if (err) {
                console.log(err);
                return res.status(440).json("Session Expired")
            }

            req.user = userInfo;
            next()
        })

} else {
    return res.status(401).json("You are not Authenticated !")
}
}

module.exports = verify