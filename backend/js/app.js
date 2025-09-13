import axios from "axios";
import Noty from "noty";
import { initStripe } from "./stripe";
import { initAdmin } from "./admin";
import moment from "moment";

let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");

// Quantity control buttons
let increaseQtyButtons = document.querySelectorAll(".increase-qty");
let decreaseQtyButtons = document.querySelectorAll(".decrease-qty");
let increaseQtyCartButtons = document.querySelectorAll(".increase-qty-cart");
let decreaseQtyCartButtons = document.querySelectorAll(".decrease-qty-cart");
let removeItemButtons = document.querySelectorAll(".remove-item-cart");

function updateCart(pizza) {
  axios
    .post("/update-cart", pizza)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: "success",
        timeout: 1000,
        text: "Item added to cart",
        progressBar: false,
      }).show();
      // Reload page to show updated quantity controls
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 1000,
        text: "Something went wrong",
        progressBar: false,
      }).show();
    });
}

function increaseQuantity(pizza) {
  axios
    .post("/cart/increase", pizza)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: "success",
        timeout: 500,
        text: "Quantity increased",
        progressBar: false,
      }).show();
      // Update total price if on cart page
      updateCartTotals();
      // Reload page to show updated quantities
      setTimeout(() => {
        window.location.reload();
      }, 600);
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 1000,
        text: "Something went wrong",
        progressBar: false,
      }).show();
    });
}

function decreaseQuantity(pizza) {
  axios
    .post("/cart/decrease", pizza)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: "success",
        timeout: 500,
        text: "Quantity decreased",
        progressBar: false,
      }).show();
      // Update total price if on cart page
      updateCartTotals();
      // Reload page to show updated quantities
      setTimeout(() => {
        window.location.reload();
      }, 600);
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 1000,
        text: "Something went wrong",
        progressBar: false,
      }).show();
    });
}

function removeItem(pizzaId) {
  axios
    .post("/cart/remove", { _id: pizzaId })
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: "success",
        timeout: 1000,
        text: "Item removed from cart",
        progressBar: false,
      }).show();
      // Reload page to show updated cart
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 1000,
        text: "Something went wrong",
        progressBar: false,
      }).show();
    });
}

function updateCartTotals() {
  // This function can be enhanced to update totals without page reload
  // For now, we'll rely on page reload for simplicity
}

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
  });
});

// Menu page quantity controls
increaseQtyButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    increaseQuantity(pizza);
  });
});

decreaseQtyButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    decreaseQuantity(pizza);
  });
});

// Cart page quantity controls
increaseQtyCartButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    increaseQuantity(pizza);
  });
});

decreaseQtyCartButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    decreaseQuantity(pizza);
  });
});

// Remove item buttons
removeItemButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizzaId = btn.dataset.pizzaId;
    removeItem(pizzaId);
  });
});

// Remove alert message after X seconds
const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}

// Change order status
let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);

function updateStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");

    // Remove any previous timestamps to avoid duplicates
    let existingTime = status.querySelector("small");
    if (existingTime) {
      existingTime.remove();
    }
  });

  let stepCompleted = true;
  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add("step-completed");
    }
    if (dataProp === order.status) {
      stepCompleted = false;

      // Create a new time element for this specific status
      let time = document.createElement("small");
      time.innerText = moment(order.updatedAt).format("hh:mm A");
      status.appendChild(time);

      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

updateStatus(order);

initStripe();

// Socket
let socket = io();

// Join
if (order) {
  socket.emit("join", `order_${order._id}`);
}

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  const user = "admin";
  initAdmin(socket, user);
  socket.emit("join", "adminRoom");
}
let deliveryAreaPath = window.location.pathname;
if (deliveryAreaPath.includes("delivery")) {
  const user = "delivery_partner";
  initAdmin(socket, user);
  socket.emit("join", "deliveryRoom");
}

socket.on("orderUpdated", (data) => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  updatedOrder.paymentStatus = data.paymentStatus;
  updateStatus(updatedOrder);
  new Noty({
    type: "success",
    timeout: 1000,
    text: "Order updated",
    progressBar: false,
  }).show();
});
