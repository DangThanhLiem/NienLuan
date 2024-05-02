const { response, query } = require('express')
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const { Query } = require('mongoose')
const slugify = require('slugify')
const product = require('../models/product')

// Controller để tạo mới sản phẩm
const createProduct = asyncHandler(async(req,res)=>{
    if(Object.keys(req.body).length===0) throw new Error ('Missing inputs')
    if(req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ?true :false,
        createProduct: newProduct? newProduct : 'Cannot create new product'
    })
})
// Controller để lấy thông tin của một sản phẩm
const getProduct = asyncHandler(async(req,res)=>{
    const {pid} = req.params
    const product = await Product.findById(pid)
    return res.status(200).json({
        success: product ?true :false,
        productData: product? product : 'Cannot get product'
    })
})
// Controller để lấy danh sách tất cả sản phẩm
// Filtering, sorting & pagination
const getProducts = asyncHandler(async (req, res, next) => {
    const queries = {...req.query };
    //Tách các trường đặc biệt ra khỏi query
    const excludeFields = ['sort', 'page', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queries[el]);
    //Format lại các operators cho đúng cú pháp mongoose
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, (macthedEl) => `$${macthedEl}`);
    const fomatedQueries = JSON.parse(queryString);
  
    //Filtering
    if (queries?.title) fomatedQueries.title = { $regex: queries.title, $options: 'i' };
    let queryCommand = Product.find(fomatedQueries);
    
    //Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      queryCommand = queryCommand.sort(sortBy);
    }
    //Filtering limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        queryCommand = queryCommand.select(fields);
      }
    //Pagination
    //limit: số object lấy về 1 lần gọi API
    //skip:2
    //1 2 3 ...10
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCT
    const skip = (page - 1) * limit
    queryCommand = queryCommand.skip(skip).limit(limit)
    //Execute query
    //Số lượng sp thõa mãn điều kiện !== số lượng sản phẩm trả về 1 lần gọi API
    try {
      const response = await queryCommand.exec();
      const counts = await Product.find(fomatedQueries).countDocuments();
      return res.status(200).json({
        success: response? true : false,
        products: response? response : 'Cannot get products',
        counts,
      });
    } catch (err) {
      return next(err);
    }
  });
// // Controller để lấy danh sách tất cả sản phẩm
// const getAllProduct = asyncHandler(async(req,res)=>{
//     const product = await Product.find()
//     return res.status(200).json({
//         success: product ?true :false,
//         productData: product? product : 'Cannot get product'
//     })
// })
// Controller để đánh giá một sản phẩm
const ratings = asyncHandler(async(req,res)=>{
    const {_id}= req.user
    const {star,comment,pid} = req.body
    if(!star || !pid) throw new Error('Missing inputs')
    const ratingProduct = await Product.findById(pid)
    const alreadyRating = ratingProduct?.ratings?.find(el=>el.postedBy.toString()===_id)
    if(alreadyRating){
        //update star & comment
        await Product.updateOne({
            ratings:{ $elemMatch:alreadyRating}
        },{
            $set:{"ratings.$.star":star,"ratings.$.comment":comment}
        })
    }else{
        //add star $ comment
        const response = await Product.findByIdAndUpdate(pid, {$push:{ratings:{star,comment,postedBy:_id}}}, {new:true})
    }
    //Sum ratings
    const updatedProduct = await Product.findById(pid)
    const ratingCount = updatedProduct.ratings.length
    const sumRatings =  updatedProduct.ratings.reduce((sum,el)=>sum+ +el.star,0)
    updatedProduct.totalRatings = Math.round(sumRatings *10/ratingCount)/10
    await updatedProduct.save()
    return res.status(200).json({
        status: true,
        updatedProduct
    })
})
// Controller để cập nhật thông tin của một sản phẩm
const updateProduct = asyncHandler(async(req,res)=>{
    const {pid} = req.params
    if(req.body &&req.body.title) req.body.slug = slugify(req.body.title)
    const updatedProduct = await Product.findByIdAndUpdate(pid,req.body,{new:true})
    return res.status(200).json({
        success: updatedProduct ?true :false,
        updateProduct: updatedProduct? updatedProduct : 'Cannot update product'
    })
})
// Controller để xóa một sản phẩm
const deleteProduct = asyncHandler(async(req,res)=>{
    const {pid} = req.params
    if(req.body &&req.body.title) req.body.slug = slugify(req.body.title)
    const deletedProduct = await Product.findByIdAndDelete(pid,req.body,{new:true})
    return res.status(200).json({
        success: deletedProduct ?true :false,
        deletedProduct: deletedProduct? deletedProduct : 'Cannot delete product'
    })
})
// Controller để tải lên hình ảnh cho sản phẩm
const uploadImagesProduct = asyncHandler(async(req,res)=>{
    const {pid} = req.params
    if(!req.files) throw new Error('Missing inputs')
    const response = await Product.findByIdAndUpdate(pid,{$push:{images:{$each: req.files.map(el =>el.path)}}},{new:true})
    return res.status(200).json({
        status : response ?true :false,
        updatedProduct: response ? response: 'Cannot upload images product'
    })
})


module.exports ={
    createProduct,
    getProduct,
    getProducts,
    // getAllProduct,
    updateProduct,
    deleteProduct,
    uploadImagesProduct,
    ratings
}