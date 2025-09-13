const Order = require('../../models/orders')

async function indexDelivery(req, res) {
  try {
      // Fetch orders that are not completed, sorted by creation date (descending order)
      const orders = await Order.find({ status:  { $nin: ['completed', 'delivered'] } })
                                .sort({ 'createdAt': -1 })
                                .populate('customerId', '-password')
                                .exec(); 

    const role = req.user.role
    const ordersData = [...orders]
    
    
    
     const resData = {ordersData, role}
    
     

      // If the request is an AJAX request (XHR)
      if (req.xhr) {
        
        
          return res.json(resData);  // Send the orders as JSON
      } else {
          return res.render('admin/deliveryOrders');  // Render the admin orders page
      }
  } catch (err) {
      // Handle any errors that may occur
      console.error(err);
      return res.status(500).send('An error occurred while fetching orders');
  }
}


async function updateStatusDelivery(req, res) {
  try {
      // Update the order's status in the database
       await Order.updateOne(
          { _id: req.body.orderId },  // Find the order by its ID
          { status: req.body.status, paymentStatus: true }, // Update the status field
      );
      const order = await Order.findById(req.body.orderId )
     
      
      

      // Emit the event to notify other parts of the system (e.g., WebSockets)
      const eventEmitter = req.app.get('eventEmitter');
      eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status, paymentStatus: true });

      // Redirect to the admin orders page
      return res.redirect('/delivery/orders');
  } catch (err) {
      // Handle any errors that occur during the update operation
      console.error(err);
      return res.redirect('/delivery/orders');
  }
}




module.exports = {indexDelivery, updateStatusDelivery}