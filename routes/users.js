const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const { checkIfAuthenticated } = require("../middlewares");
const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

// import in the User model
const { User } = require('../models');

const { createRegistrationForm, createLoginForm, bootstrapField } = require('../forms');

// this route is used for the view of all users
router.get('/',checkIfAuthenticated, async (req,res)=>{
    let users = await User.collection().fetch();
      res.render("users/index.hbs", {
        'users': users.toJSON(),
      });
})

// this route is to manually register new clients
router.get('/register', (req,res)=>{
    // display the registration form
    const registerForm = createRegistrationForm();
    res.render('users/register.hbs', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

// this route is to manually register new clients
router.post('/register', (req, res) => {
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        success: async (form) => {
            const user = new User({
                'firstname': form.data.firstname,
                'lastname': form.data.lastname,
                'email': form.data.email,
                'address': form.data.address,
                'password': getHashedPassword(form.data.password),
                'role' : 'admin'
            });
            await user.save();
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// this route is for the admin login
router.get('/login', (req,res)=>{
    const loginForm = createLoginForm();
    res.render('users/login',{
        'form': loginForm.toHTML(bootstrapField)
    })
})

// this route is for the admin login
router.post('/login', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // process the login

            // ...find the user by email and password
            let user = await User.where({
                'email': form.data.email,
                'role' : 'admin'
            }).fetch({
               require:false}
            );

            if (!user) {
                req.flash("error_messages", "Sorry, the authentication details you provided does not work.user issue")
                res.redirect('/users/login');
            } else {
                // check if the password matches
                if (user.get('password') === getHashedPassword(form.data.password)) {
                    // add to the session that login succeed

                    // store the user details
                    req.session.user = {
                        id: user.get('id'),
                        firstname: user.get('firstname'),
                        lastname: user.get('lastname'),
                        email: user.get('email')
                    }
                    req.flash("success_messages", "Welcome back, " + user.get('firstname') + ' ' + user.get('lastname'));
                    res.redirect('/users/profile');
                } else {
                    req.flash("error_messages", "Sorry, the authentication details you provided does not work.password issue")
                    res.redirect('/users/login')
                }
            }
        }, 'error': (form) => {
            req.flash("error_messages", "There are some problems logging you in. Please fill in the form again")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// this route is for the admin login
router.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login');
    } else {
        res.render('users/profile',{
            'user': user
        })
    }
})

// this route is for the admin logout
router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', "Logged out successful");
    res.redirect('/users/login');
})




module.exports = router;
