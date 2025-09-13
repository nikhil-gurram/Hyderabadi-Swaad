import axios from "axios";
import moment from "moment";
import Noty from "noty";

export function initAdmin(socket, user) {
  const orderTableBody = document.querySelector("#orderTableBody");
  let orders = [];
  let markup;
  let url;
  if (user === "admin") {
    url = "/admin/orders";
  } else if (user === "delivery_partner") {
    url = "/delivery/orders";
  }
  axios
    .get(url, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    })
    .then((res) => {
      orders = res.data.ordersData;
      const role = res.data.role;
      markup = generateMarkup(orders, role);
      orderTableBody.innerHTML = markup;
    })
    .catch((err) => {
      console.log(err);
    });

  function renderItems(items) {
    let parsedItems = Object.values(items);
    return parsedItems
      .map((menuItem) => {
        // Add null checks to prevent errors
        const itemName =
          menuItem && menuItem.item && menuItem.item.name
            ? menuItem.item.name
            : "Unknown Item";
        const itemQty = menuItem && menuItem.qty ? menuItem.qty : 0;
        return `
                <p>${itemName} - ${itemQty} pcs </p>
            `;
      })
      .join("");
  }

  function generateMarkup(orders, role) {
    return orders
      .map((order) => {
        // Add null check for customer name
        const customerName =
          order.customerId && order.customerId.name
            ? order.customerId.name
            : "Unknown Customer";

        return `
                <tr>
                <td class="border px-4 py-2 text-green-900">
                    <p>${order._id}</p>
                    <div>${renderItems(order.items)}</div>
                </td>
                <td class="border px-4 py-2">${customerName}</td>
                <td class="border px-4 py-2">${order.address}</td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form  action="${
                          role === "admin"
                            ? "/admin/order/status"
                            : "/delivery/order/status"
                        }"  method="POST">
                            <input type="hidden" name="orderId" value="${
                              order._id
                            }">
                            <select name="status" onchange="this.form.submit()"
                                class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                <option value="order_placed"
                                    ${
                                      order.status === "order_placed"
                                        ? "selected"
                                        : ""
                                    } ${
          role === "delivery_partner" ? "disabled" : ""
        }>
                                    Placed</option>
                                <option value="confirmed" ${
                                  order.status === "confirmed" ? "selected" : ""
                                } ${
          role === "delivery_partner" ? "disabled" : ""
        }>
                                    Confirmed</option>
                                <option value="prepared" ${
                                  order.status === "prepared" ? "selected" : ""
                                } ${
          role === "delivery_partner" ? "disabled" : ""
        }>
                                    Prepared</option>
                                <option value="delivered" ${
                                  order.status === "delivered" ? "selected" : ""
                                } ${role === "admin" ? "disabled" : ""}>
                                    Delivered
                                </option>
                                <option value="completed" ${
                                  order.status === "completed" ? "selected" : ""
                                } ${
          role === "delivery_partner" ? "disabled" : ""
        }>
                                    Completed
                                </option>
                            </select>
                        </form>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20">
                                <path
                                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </td>
                <td class="border px-4 py-2">
                    ${moment(order.createdAt).format("hh:mm A")}
                </td>
                <td class="border px-4 py-2">
                    ${order.paymentStatus ? "paid" : "Not paid"}
                </td>
            </tr>
        `;
      })
      .join("");
  }

  socket.on("orderPlaced", (order) => {
    new Noty({
      type: "success",
      timeout: 1000,
      text: "New order!",
      progressBar: false,
    }).show();
    orders.unshift(order);
    orderTableBody.innerHTML = "";
    orderTableBody.innerHTML = generateMarkup(orders);
  });
}
