const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { User, BlacklistedToken } = require("../../models")
const { checkIfAuthenticatedJWT } = require("../../middleware")

const generateAccessToken = (user, secret, expiresIn) => {
    return jwt.sign(user, secret, {
        "expiresIn": expiresIn
    })
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash("sha256")
    const hash = sha256.update(password).digest("base64")
    return hash
}

router.post("/login", async (req, res) => {
    let user = await User.where({
        "email": req.body.email
    }).fetch({
        require: false
    })
    if (user && user.get("password") == getHashedPassword(req.body.password)) {
        const userObject = {
            "name": user.get("name"),
            "email": user.get("email"),
            "id": user.get("id")
        }
        let accessToken = generateAccessToken(userObject, process.env.TOKEN_SECRET, "15m")
        let refreshToken = generateAccessToken(userObject, process.env.REFRESH_TOKEN_SECRET, "7d")
        let id = user.get("id")
        res.send({ accessToken, refreshToken, id })
    } else {
        res.status(204)
        res.send({
            "Error": "Invalid Email/Password"
        })
    }
})

router.get("/profile", checkIfAuthenticatedJWT, async (req, res) => {
    let user = req.user
    res.send(user)
})

router.post("/refresh", async (req, res) => {
    let refreshToken = req.body.refreshToken
    if (!refreshToken) {
        res.sendStatus(401);
    }

    let blacklistedToken = await BlacklistedToken.where({
        "token": refreshToken
    }).fetch({
        require: false
    })

    if (blacklistedToken) {
        res.status(401)
        res.send("Refresh token expired.")
        return
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            res.sendStatus(403)
        } else {
            let accessToken = generateAccessToken({
                "name": user.name,
                "id": user.id,
                "email": user.email
            }, process.env.TOKEN_SECRET, "15m")
            res.send({
                accessToken
            })
        }
    })
})


router.post("/logout", async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(403);
    } else {
        let blacklistedToken = await BlacklistedToken.where({
            "token": refreshToken
        }).fetch({
            require: false
        })

        if (blacklistedToken) {
            res.status(401)
            res.send("Token Expired")
            return
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) {
                res.sendStatus(403);
            } else {
                const token = new BlacklistedToken();
                token.set("token", refreshToken)
                token.set("date_created", new Date())
                await token.save()
                res.send({
                    "Message": "Logged Out"
                })
            }
        })
    }
})

router.post("/register", async (req, res) => {
    // Check if email is already in use
    let checkEmail = await User.where({
        "email": req.body.email
    }).fetch({
        require: false
    })
    if (checkEmail) {
        res.send("Email already in used")
    } else {
        try {
            // Add user into table
            const user = new User()
            user.set("name", req.body.name)
            user.set("email", req.body.email)
            user.set("password", getHashedPassword(req.body.password))
            user.set("address", req.body.address)
            user.set("contact_number", req.body.contact_number)
            user.set("date_of_birth", req.body.date_of_birth)
            await user.save()

            // send back ok
            res.send(user)
        } catch (e) {
            console.log(e)
            res.send("Unable to create user")
        }
    }
})

// GET profile details
router.get("/edit/:user_id", async (req, res) => {
    // get details by user_id
    let id = req.params.user_id
    try {
        let user = await User.where({
            "id": id
        }).fetch({
            require: true
        })
        res.send(user)
    } catch (e) {
        console.log(e)
        res.send("Error")
    }
})

// POST Profile change
router.post("/edit/:user_id", async (req, res) => {
    let id = req.params.user_id
    let user = await User.where({
            "id": id
        }).fetch({
            require: true
        })
        
    if (req.body.password){
        try {
            user.set("password", getHashedPassword(req.body.password))
            user.save()
            res.send("Password Updated")
        } catch (e) {
            console.log(e)
            res.send("Error")
        }
    }

    if (req.body.address){
        try {
            user.set("address", req.body.address)
            user.save()
            res.send("Address Updated")
        } catch (e) {
            console.log(e)
            res.send("Error")
        }
    }
})
module.exports = router