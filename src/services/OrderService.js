const { omit } = require("lodash");
const { Order, OrderDetail, User, Product } = require("../configs/models");
const { Op } = require("sequelize");

const orderService = {
    findOne: async (order_id) => {
        try{
            const order = await Order.findOne({
                where: { order_id: order_id }
            });
            return order;
        }catch(err){
            throw new Error();
        }
    },
    checkOrderByCustomer: async (order_id, user_id) => {
        try{
            const order = await Order.findOne({
                where: { user_id: user_id, order_id: order_id }
            });

            return order;
        }catch(err){
            throw new Error();
        }
    },
    findOrderByCustomer: async (user_id) => {
        try{
            const orders = await Order.findAll({
                where: { user_id: user_id }
            });

            return orders.map(order => omit(order.toJSON(), ["user_id"]));
        }catch(err){
            throw new Error();
        }
    },
    findOrderDetailByCustomer: async (order_id) => {
        try{
            const orderdetails = await OrderDetail.findAll({
                where: { order_id: order_id },
                include: [ Product ]
            });
            const formattedOrderDetails = orderdetails.map(od => {
                const odJson = od.toJSON();
                const formattedOrderDetail = omit(odJson, ["product_id"]);
                if (formattedOrderDetail.product) {
                    formattedOrderDetail.product = omit(formattedOrderDetail.product, ["category_id", "brand_id", "description", "quantity", "status"]);
                }
                return formattedOrderDetail;
            });
    
            return formattedOrderDetails;
        }catch(err){
            throw new Error();
        }
    },
    findOrderDetail: async (order_id) => {
        try{
            const orderdetails = await OrderDetail.findAll({
                where: { order_id: order_id },
                include: [ Product ]
            });
            const formattedOrderDetails = orderdetails.map(od => {
                const odJson = od.toJSON();
                const formattedOrderDetail = omit(odJson, ["product_id"]);
                if (formattedOrderDetail.product) {
                    formattedOrderDetail.product = omit(formattedOrderDetail.product, ["category_id", "brand_id", "description", "quantity", "status"]);
                }
                return formattedOrderDetail;
            });
    
            return formattedOrderDetails;
        }catch(err){
            throw new Error();
        }
    },
    findOrders: async (query) => {
        try{
            const { search, status, page, limit } = query;
            const whereCondition = {};
            

            if(search) { 
                whereCondition[Op.or] = [
                    { phone: { [Op.like]: `%${search}%` } },
                    { fullName: { [Op.like]: `%${search}%` } }
                ];
            };
            if(status) { whereCondition.status = status };

            const options = {
                where: whereCondition,
                order: [['order_id', 'desc']],
                include: [{
                    model: User,
                }],
            };

            if(page && limit) {
                const offset = (page - 1) * limit;
                options.limit = parseInt(limit);
                options.offset = parseInt(offset);
            }

            const count = await Order.count({
                where: whereCondition,
                include: [{
                    model: User,
                }],
            });

            const orders = await Order.findAll(options);
            return { count: count, rows: orders };
        }catch(err){
            throw new Error();
        }
    },
    createOrder: async (user_id, total_price, order_address, payment_method, fullname, phone) => {
        try{
            const order_date = new Date().toLocaleDateString('vi-VN');
            const status = "pending";
            const order = await Order.create({ user_id, total_price, order_address, order_date, payment_method, fullname, phone, status });
            return order;
        }catch(err){
            throw new Error();
        }
    },
    createOrderAnonymous: async (total_price, order_address, payment_method, fullname, phone) => {
        try{
            const order_date = new Date().toLocaleDateString('vi-VN');
            const status = "pending";
            const order = await Order.create({ total_price, order_address, order_date, payment_method, fullname, phone, status });
            return order;
        }catch(err){
            throw new Error();
        }
    },
    createOrderDetail: async (order_id, carts) => {
        try{
            const count = carts.length;
            const order_details = [];

            for (const cart of carts) {
                const { product_id, price } = cart.product;
                const quantity = cart.quantity;
                const orderDetail = await OrderDetail.create({ order_id, price, quantity, product_id });
                order_details.push(orderDetail);
            }
    
            return order_details.length === count;
        }catch(err){
            throw new Error();
        }
    },
    createOrderDetailAnonymous: async (order_id, carts) => {
        try{
            const count = carts.length;
            const order_details = [];

            for (const cart of carts) {
                const { product_id, price, quantity } = cart;
                const orderDetail = await OrderDetail.create({ order_id, price, quantity, product_id });
                order_details.push(orderDetail);
            }
    
            return order_details.length === count;
        }catch(err){
            throw new Error();
        }
    },
    deleteOrder: async (order_id) => {
        try{
            const deleteOrder = await Order.destroy({
                where: { order_id: order_id }
            });

            return deleteOrder;
        }catch(err){
            throw new Error();
        }
    },
    deleteAll: async (order_id) => {
        try{
            const deleteAll = await OrderDetail.destroy({
                where: { order_id: order_id }
            });

            return deleteAll ;
        }catch(err){
            throw new Error();
        }
    },
    updateStatusOrder: async (order_id, status) => {
        try{
            const isUpdated = await Order.update({ status: status }, {
                where: { order_id: order_id }
            });
            
            return isUpdated > 0;
        }catch(err){
            throw new Error();
        }
    }
}

module.exports = orderService;