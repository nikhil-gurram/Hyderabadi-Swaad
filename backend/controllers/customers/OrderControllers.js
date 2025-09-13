const Order = require('../../models/orders')
const moment = require('moment')
const stripe = require('stripe')(process.env.STRIPE_SK)

async function store(req, res) {
    // Validate request
    const { phone, address, stripeToken, paymentType } = req.body;

    if (!phone || !address) {
        return res.status(422).json({ message: 'All fields are required' });
    }

    try {
        // Create a new order
        const order = new Order({
            customerId: req.user._id,
            items: req.session.cart.items,
            phone,
            address,
        });

        // Save the order to the database
        const result = await order.save();

        // Populate the customerId field
        const placedOrder = await Order.populate(result, { path: 'customerId' });

        

        // If payment type is card, proceed with Stripe payment
        if (paymentType === 'card') {
            try {
                // Process Stripe payment
                await stripe.charges.create({
                    amount: req.session.cart.totalPrice * 100, // Convert price to cents
                    source: stripeToken,
                    currency: 'inr',
                    description: `Pizza order: ${placedOrder._id}`,
                });

                // Update order with payment status and type
                placedOrder.paymentStatus = true;
                placedOrder.paymentType = paymentType;
                const ord = await placedOrder.save();

                // Emit event for order placed
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderPlaced', ord);

                // Clear cart
                delete req.session.cart;

                // Send response back
                return res.json({ message: 'Payment successful, Order placed successfully' });
            } catch (err) {
                // Handle Stripe payment failure
                console.error('Stripe Payment Error:', err);
                delete req.session.cart;
                return res.json({ message: 'Order placed but payment failed. You can pay at delivery time' });
            }
        } else {
            // If payment type is not card (cash on delivery)
            delete req.session.cart;
            return res.json({ message: 'Order placed successfully' });
        }
    } catch (err) {
        // Handle errors (e.g., database issues)
        console.error('Order Error:', err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}


async function indexOrder(req, res) {
    try {
        // Fetch the orders for the logged-in user and populate the `items` field with details from the Menu collection
        const orders = await Order.find({ customerId: req.user._id })
              // Populate the `items` field with data from the Menu model
            .sort({ createdAt: -1 });  // Sort orders by creation date in descending order

        res.header('Cache-Control', 'no-store');
      
        
        

        // Render the orders page and pass the orders along with the moment.js instance
        res.render('customers/orders', { orders: orders, moment: moment });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching orders');
    }
}


async function showOrders(req, res){
    const order = await Order.findById(req.params.id)
     // Authorize user
     if(req.user._id.toString() === order.customerId.toString()) {
        return res.render('customers/singleOrder', { order })
    }
    return  res.redirect('/')
}

module.exports = {indexOrder, showOrders, store}