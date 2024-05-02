
const asyncHandler = require('express-async-handler')
const Customer = require('../models/customer')

// Tạo mới khách hàng
const createNewCustomer = asyncHandler(async(req,res)=>{
    const response = await Customer.create(req.body)
    return res.json({
        success:response ? true :false,
        createdCustomer: response? response:'Cannot create new customer'
    })
})
// Lấy danh sách khách hàng
const getCustomers = asyncHandler(async(req,res)=>{
    const response = await Customer.find()
    return res.json({
        success:response ? true :false,
        Customer: response? response:'Cannot get customer'
    })
})
// Cập nhật thông tin khách hàng
const updateCustomers = asyncHandler(async(req,res)=>{
    const { cid }  = req.params
    if(Object.keys(req.body).length === 0) throw new Error(' Missing inputs')
    const response = await Customer.findByIdAndUpdate(cid,req.body,{new:true})
    return res.status(200).json({
        success:response? true :false,
        updateCustomers: response ? response: 'Something went wrong'
    })
})
// Xóa khách hàng
const deleteCustomer = asyncHandler(async(req,res)=>{
    const {cid} = req.params
    const response = await Customer.findByIdAndDelete(cid)
    return res.json({
        success:response ? true :false,
        DeleteBrand: response? response:'Cannot delete customer'
    })
})
// Cập nhật giỏ hàng của khách hàng
const updateCart = asyncHandler(async(req,res)=>{
    const { customerId } = req.params;
    const { pid, quantity } = req.body;
  
    if (!pid || !quantity) {
      throw new Error('Missing inputs');
    }
  
    const customer = await Customer.findById(customerId).select('cart');
    const alreadyProductIndex = customer?.cart?.findIndex(
      (el) => el.product.toString() === pid
    );
  
    if (alreadyProductIndex !== -1) {
      const response = await Customer.updateOne(
        { _id: customerId, 'cart.product': pid },
        { $set: { 'cart.$.quantity': quantity } },
        { new: true }
      );
  
      return res.status(200).json({
        success: response.nModified > 0,
        updateCustomer: response.nModified > 0 ? response : 'Something went wrong',
      });
    } else {
      const response = await Customer.findByIdAndUpdate(
        customerId,
        { $push: { cart: { product: pid, quantity } } },
        { new: true }
      );
  
      return res.status(200).json({
        success: response ? true : false,
        updateUser: response ? response : 'Something went wrong',
      });
    }
  });

module.exports = {
    createNewCustomer,
    getCustomers,
    updateCustomers,
    deleteCustomer,
    updateCart
}