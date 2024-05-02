const asyncHandler = require('express-async-handler')
const Order = require('../models/order')
const User= require('../models/user')
const Coupon = require('../models/coupon')

const createOrder = asyncHandler(async(req,res)=>{
  const { _id } = req.user
  const {coupon} =req.body
  const userCart = await User.findById(_id)
    .select('cart')
    .populate('cart.product', 'title price')
  const products = userCart?.cart?.map(el => ({
    product: el.product._id,
    count: el.quantity,
    size:el.size,
  }));
  let total = userCart?.cart?.reduce(
    (sum, el) => el.product.price * el.quantity + sum,
    0
  )
  const createData = await Order.create({ products, total, orderBy: _id })
  if(coupon){
    const selectedCoupon = await Coupon.findById(coupon)
    total = Math.round(total * (1- +selectedCoupon?.discount/100)/1000)*1000 || total
    createData.total =total
    createData.coupon = coupon
  }
  
  const order = await Order.create(createData);
  await order.save();
  return res.json({
    success: order ? true : false,
    order: order ? order : 'Something went wrong',
  });
});
const updateStatus = asyncHandler(async(req,res)=>{
    const {oid} = req.params
    const {status} =req.body
    if(!status) throw new Error ('Missing status')
    const response = await Order.findByIdAndUpdate(oid,{status},{new:true})
    return res.json({
        success:response ? true :false,
        updated: response? response:'Cannot update Status'
    })
})
const getUserOrder = asyncHandler(async(req,res)=>{
    const { _id } = req.user 
    const response = await Order.find({orderBy:_id})
    return res.json({
        success:response ? true :false,
        response: response? response:'Something went wrong'
    })
})
const getOrders = asyncHandler(async(req,res)=>{
    const response = await Order.find()
    return res.json({
        success:response ? true :false,
        response: response? response:'Cannot get orders'
    })
})
module.exports = {
    createOrder,
    updateStatus,
    getUserOrder,
    getOrders
}