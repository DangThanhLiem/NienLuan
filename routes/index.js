const userRouter = require('./user')
const productRouter = require('./product')
const orderRouter = require('./order')
const customerRouter = require('./customer')
const categoryRouter =require('./category')
const couponRouter =require('./coupon')
const {notFound,errHandler} = require('../middlewares/errHandler')


const initRouters = (app) =>{
    app.use('/api/user',userRouter)
    app.use('/api/product',productRouter)
    app.use('/api/category',categoryRouter)
    app.use('/api/order',orderRouter)
    app.use('/api/coupon',couponRouter)
    app.use('/api/customer',customerRouter)


    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRouters