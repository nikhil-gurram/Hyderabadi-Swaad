function admin(req, res, next){
    if(req.isAuthenticated() && req.user.role === 'admin'){
       return  next()
    }
    return res.redirect('/')
}
function delivery(req, res, next){
    if(req.isAuthenticated() && req.user.role === 'delivery_partner'){
       return  next()
    }
    return res.redirect('/')
}

function auth(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    return res.redirect('/login')
}

function guest (req, res, next) {
    if(!req.isAuthenticated()) {
        return next()
    }
    return res.redirect('/')
}

module.exports = {admin, auth, guest, delivery}