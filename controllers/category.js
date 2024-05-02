const ProductCategory = require('../models/category')
const asyncHandler = require('express-async-handler')

// Controller để tạo mới danh mục sản phẩm
const createCategory = asyncHandler(async(req,res)=>{
    const response = await ProductCategory.create(req.body)
    return res.json({
        success:response ? true :false,
        createdCategory: response? response:'Cannot create new product-category'
    })
})
// Controller để lấy danh sách danh mục sản phẩm
const getCategories = asyncHandler(async(req,res)=>{
    const response = await ProductCategory.find().select('title _id')
    return res.json({
        success:response ? true :false,
        ProductCategories: response? response:'Cannot get product-category'
    })
})
// Controller để cập nhật danh mục sản phẩm
const updateCategory = asyncHandler(async(req,res)=>{
    const {pcid} = req.params
    const response = await ProductCategory.findByIdAndUpdate(pcid,req.body,{new:true})
    return res.json({
        success:response ? true :false,
        UpdateCategory: response? response:'Cannot update product-category'
    })
})
// Controller để xóa danh mục sản phẩm
const deleteCategory = asyncHandler(async(req,res)=>{
    const {pcid} = req.params
    const response = await ProductCategory.findByIdAndDelete(pcid)
    return res.json({
        success:response ? true :false,
        DeleteCategory: response? response:'Cannot delete product-category'
    })
})

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
}