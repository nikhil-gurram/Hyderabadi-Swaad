const User = require('../models/users.js')
const bcrypt = require('bcrypt')
const passport = require('../Auth/passport.js')

const _getRedirectUrl = (req) => {
    if(req.user.role === 'delivery_partner') {
        return '/delivery/orders'
    }
    return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders'
}


// GET register
function register(req, res) {
    res.render('auth/register')
}


// POST register
 async function postRegister(req, res){
    const { name, email, password }   = req.body
    if(!name || !email || !password) {
        req.flash('error', 'All fields are required')
        req.flash('name', name)
        req.flash('email', email)
       return res.redirect('/register')
    
    }
    try {
        // Use await for asynchronous operations
        const userExists = await User.exists({ email: email });

        if (userExists) {
            req.flash('error', 'Email already taken');
            req.flash('name', name);
            req.flash('email', email);
            return res.redirect('/register');  // Return to stop further execution
        }

    } catch (err) {
        // Handle any errors
        return next(err);  // Pass the error to the error-handling middleware
    }


    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
        name,
        email,
        password: hashedPassword
    })
  
     user.save().then((user) => {
        return res.redirect('/')
     }).catch(err => {
        req.flash('error', 'Something went wrong')
            return res.redirect('/register')
     })
}

//GET login 
function login(req, res) {
    res.render('auth/login')
}

//POST login
function postLogin(req, res,next){
    const { email, password }   = req.body
    if(!email || !password) {
        req.flash('error', 'All fields are required')
        return res.redirect('/login')
    }
    passport.authenticate('local', (err, user, info) => {
        if(err){  
            req.flash('error', info.message)
            return next(err)
        }
        if(!user) {
            console.log(info.message);
            req.flash('error', info.message )
            return res.redirect('/login')
        }
        req.logIn(user, (err) => {
            if(err) {
                req.flash('error', info.message ) 
                return next(err)
            }

            return res.redirect(_getRedirectUrl(req))
        })
    })(req, res, next)
}




// logout
function logout(req, res) {
    req.logout((err) => {
        if (err) {
            // Handle the error if needed
            console.error('Logout error:', err);
            return res.status(500).send('Could not log out. Please try again.');
        }
        return res.redirect('/login'); // Redirect after successful logout
    });
}



module.exports = {postRegister, register, postLogin, login, logout}
