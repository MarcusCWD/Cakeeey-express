const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { checkIfAuthenticatedJWT } = require("../../middlewares");
const { BlacklistedToken, User } = require("../../models")
const generateAccessToken = (user, secret, expiresIn) => {
  return jwt.sign(
    {
    'id': user.id,
    'email': user.email,
    },
    secret,
    {
      expiresIn: expiresIn,
    }
  );
};

const getHashedPassword = (password) => {
  const sha256 = crypto.createHash("sha256");
  const hash = sha256.update(password).digest("base64");
  return hash;
};

// Submit login details
router.post("/login", async (req, res) => {
  let user = await User.where({
    email: req.body.email,
  }).fetch({
    require: false,
  });
  if (user && user.get("password") == getHashedPassword(req.body.password)) {
    const userObject = {
      email: user.get("email"),
      id: user.get("id"),
    };
    let accessToken = generateAccessToken(
      userObject,
      process.env.TOKEN_SECRET,
      "15m"
    );
    let refreshToken = generateAccessToken(
      userObject,
      process.env.REFRESH_TOKEN_SECRET,
      "7d"
    );
    res.send({
      accessToken,
      refreshToken,
    });
  } else {
    res.send({
      error: "Wrong email or password",
    });
  }
});

// read the profile if condition of middleware is met
router.get('/profile', checkIfAuthenticatedJWT, async function(req,res) {
  let user = await User.where({
      'id': req.user.id
  }).fetch({
      require: true
  });
  res.send(user)
})

router.post('/refresh', async(req,res)=>{
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    }
    // check if the refresh token has been black listed
    let blacklistedToken = await BlacklistedToken.where({
        'token': refreshToken
    }).fetch({
        require: false
    })

    // if the refresh token has already been blacklisted
    if (blacklistedToken) { 
        res.status(401);
        return res.send('The refresh token has already expired')
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
        if (err) {
            return res.sendStatus(403);
        }
        let accessToken = generateAccessToken(user, process.env.TOKEN_SECRET, '15m');
        res.send({
            accessToken
        });
    })
})

router.post('/logout', async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    } else {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,async (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            const token = new BlacklistedToken();
            token.set('token', refreshToken);
            token.set('date_created', new Date()); // use current date
            await token.save();
            res.send({
                'message': 'logged out'
            })
        })
    }
})

router.post("/register", async (req, res) => {
      try {
          // Add user into table
          const user = new User()
            user.set("firstname", req.body.firstname)
            user.set("lastname", req.body.lastname)
            user.set("email", req.body.email)
            user.set("password", getHashedPassword(req.body.password))
            user.set("address", req.body.address)
            user.set("role", 'user')
            await user.save()

            // send back ok
            res.send(user)
          }
       catch (e) {
          console.log(e)
          res.send("error")
      }
})

module.exports = router;
