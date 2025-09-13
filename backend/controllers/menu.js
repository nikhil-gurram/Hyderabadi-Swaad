const Menu = require('../models/menu')

async function menu(req, res){
    const pizzas = await Menu.find()
    return res.render('menus', {pizzas: pizzas})

}module.exports = {menu}
