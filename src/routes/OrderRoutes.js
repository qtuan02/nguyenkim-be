const { Router } = require("express");
const authenticate = require("../common/securities/middleware");
const orderController = require("../controllers/OrderController");

const orderRoutesAdmin = Router();
const orderRoutesCustomer = Router();

orderRoutesAdmin.get("/", [authenticate.authenticateToken, authenticate.permission(['admin'])], orderController.findAll);
orderRoutesAdmin.get("/:id", [authenticate.authenticateToken, authenticate.permission(['admin'])], orderController.findOrderDetail);

orderRoutesCustomer.get("/history", orderController.findOrderByCustomer);
orderRoutesCustomer.post("/payment", orderController.paymentOfCart);
orderRoutesCustomer.post("/pay", orderController.paymentOfAnonymous);

module.exports = {
    orderRoutesAdmin,
    orderRoutesCustomer
};