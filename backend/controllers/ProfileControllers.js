const User = require('../models/users.js')

async function getProfile(req, res){
    try{
      const user = await User.findById(req.params.id)
      if (!user) return res.status(404).send('User not found');
      if(user.role === 'admin'){
      return  res.render('admin/adminProfile', {admin: user})
      }
    return  res.render('customers/profile', {user: user})
    }catch(e){
        res.status(500).send('Server error'+ e);
    }
}

async function editProfile(req, res){
    
    try{
       
        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).send('User not found');
        res.render('customers/edit-profile', {user: user})
      }catch(e){
          res.status(500).send('Server error' + e);
      }
}

async function updateProfile(req, res){
    try {
        const updatedUser = {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          address: req.body.address,
        };
        const user = await User.findByIdAndUpdate(req.user._id, updatedUser, { new: true });
        res.redirect(`/profile/${user._id}`);
       } catch (err) {
        console.log(err);
        res.status(500).send('Error updating profile.');
      }
}

module.exports = {getProfile, editProfile, updateProfile}