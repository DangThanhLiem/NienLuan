const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const {generateAccessToken,generateRefreshToken} = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const sendMail = require('../ultils/sendMail')
const crypto = require('crypto')

// Controller để đăng ký người dùng mới
const register = asyncHandler(async(req,res)=>{
    const {email,password,firstname,lastname} =req.body

    if(!email || !password || !lastname || !firstname)
    return res.status(400).json({
        success: false,
        mes:'Missing Inputs'
    })   
    const user = await User.findOne({email})
    if(user)
        throw new Error('User has existed!')
    else{
        const newUser = await User.create(req.body)
        return res.status(200).json({
            success: newUser ? true: false,
            response:newUser ? 'Register is successfully.Please go login': 'Something went wrong'
        })
    }
})
// Controller để đăng nhập

const login = asyncHandler(async(req,res)=>{
    const {email,password} =req.body
    if(!email || !password )
    return res.status(400).json({
        success: false,
        mes:'Missing Inputs'
    })
    // plain oject
    const response = await User.findOne({email})
    if(response && await response.isCorrectPassword(password)){
        // Tach password ra khoi response
        const {password,role,refreshToken, ...userData} = response.toObject()
        //Tao access token
        const accessToken = generateAccessToken(response._id,role)
        //Tao refresh token
        const newrefreshToken = generateRefreshToken(response._id)
        //Luu refresh token vao database
        await User.findByIdAndUpdate(response._id, {refreshToken: newrefreshToken},{new:true})
        //Luu refresh token vao cookie
        res.cookie('refreshToken',newrefreshToken,{httpOnly:true,maxAge:7*24*60*60*1000})
        return  res.status(200).json({
            success:true,
            accessToken,
            userData
        })
    }else{
        //xac thuc khong hop le
        throw new Error('Invalid credentials!')
    }

})

// Controller để lấy thông tin người dùng hiện tại
const getCurrent= asyncHandler(async(req,res)=>{
    const {_id} = req.user
    const user = await User.findById(_id).select('-refreshToken -password -role')
    return res.status(200).json({
        success: user? true:false,
        rs: user ? user :'User is not found'
    })  
})
// Controller để làm mới access token
const refreshAccessToken = asyncHandler(async(req,res) =>{
    //lay token tu cookies
    const cookie = req.cookies
    //check xem co token hay khong
    if(!cookie && !cookie.refreshToken)
    throw new Error ('No refresh token in cookies')
    //check token co hop le
    const rs =await jwt.verify(cookie.refreshToken,process.env.JWT_SECRET)
    //check token co giong token da luu trong database
        const response = await User.findOne({_id:rs._id,refreshToken: cookie.refreshToken})
        return  res.status(200).json({
            success: response ? true : false, 
            newAccessToken:response ? generateAccessToken( response._id,response.role):'Refresh token not matched'
        })
})
// Controller để đăng xuất
const logout = asyncHandler(async(req,res) =>{
    //lay token tu cookies
    const cookie = req.cookies
    //check xem co token hay khong
    if(!cookie || !cookie.refreshToken)
    throw new Error ('No refresh token in cookies')
    //xoa refresh token o database
    await User.findOneAndUpdate({refreshToken: cookie.refreshToken},{refreshToken:''},{new:true})
    //xoa refresh token o cookie trinh duyet
    res.clearCookie('refreshToken',{
        httpOnly:true,
        secure:true
    })
    return res.status(200).json({
        success:true,
        mes:'Logout is done'
    })
})
    //Client gui mail
    //Server check email co hop le khong => Gui mail + kem link(password change token)
    //Client check mail -> click link
    //Client gui api kem token
    //Check token co giong token ma server gui khong mail hay khong
    //Change password 
// Controller để quên mật khẩu
const forgotPassword = asyncHandler(async(req,res)=>{
    const {email} = req.query
    if(!email) throw new Error(' Missing email')
    const user = await User.findOne({email})
    if(!user) throw new Error('User is not found')
    const resetToken = user.createPasswordChangedToken()
    await user.save()


    const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn 15 phút kể từ bây giờ. <a href=
    ${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here</a>`

    const data = {
        email,
        html
    }
    const rs= await sendMail(data)
    return res.status(200).json({
        success:true,
        rs
    })
})
// Controller để đặt lại mật khẩu
const resetPassword = asyncHandler(async(req,res)=>{
    const {password, token}=req.body
    if(!password || !token) throw new Error(' Missing inputs')
    const passwordResetToken =crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ passwordResetToken, passwordResetExpires: {$gt: Date.now()}} )
    if(!user) throw new Error('Invalid reset token')
    user.password = password
    user.passwordResetToken =  undefined
    user.passwordChangeAt = Date.now()
    user.passwordResetExpires = undefined
    await user.save()
    return res.status(200).json({
        success: user ? true : false,
        mes: user ? 'Updated password' : 'Something went wrong'
    })
})
// Controller để lấy danh sách người dùng
const getUsers = asyncHandler(async(req,res)=>{
    const response = await User.find().select('-refreshToken -password -role')
    return res.status(200).json({
        success:response? true :false,
        users: response
    })
})
// Controller để xóa người dùng
const deleteUser = asyncHandler(async(req,res)=>{
    const {_id} = req.query
    if(!_id) throw new Error(' Missing inputs')
    const response = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        success:response? true :false,
        deleteUser: response ? `User with email ${response.email} deleted` : 'No user delete'
    })
})
// Controller để cập nhật thông tin người dùng bằng id
const updateUser = asyncHandler(async(req,res)=>{
    const {_id} = req.user
    if(!_id || Object.keys(req.body).length === 0) throw new Error(' Missing inputs')
    const response = await User.findByIdAndUpdate(_id,req.body,{new:true}).select('-password -role')
    return res.status(200).json({
        success:response? true :false,
        updateUser: response ? response: 'Something went wrong'
    })
})
// Controller để cập nhật thông tin người dùng bởi admin
const updateUserByAdmin = asyncHandler(async(req,res)=>{
    const { uid }  = req.params
    if(Object.keys(req.body).length === 0) throw new Error(' Missing inputs')
    const response = await User.findByIdAndUpdate(uid,req.body,{new:true}).select('-password -role')
    return res.status(200).json({
        success:response? true :false,
        updateUser: response ? response: 'Something went wrong'
    })
})
// Controller để cập nhật địa chỉ người dùng
const updateUserAddress = asyncHandler(async(req,res)=>{
    const {_id}  = req.user
    if(!req.body.address) throw new Error(' Missing inputs')
    const response = await User.findByIdAndUpdate(_id,{$push: { address: req.body.address}},{new:true}).select('-password -role')
    return res.status(200).json({
        success:response? true :false,
        updateUser: response ? response: 'Something went wrong'
    })
})
// Controller để cập nhật cart người dùng
const updateCart = asyncHandler(async(req,res)=>{
    const {_id}  = req.user
    const {pid,quantity,size} =req.body
    if( !pid|| !quantity|| !size) throw new Error(' Missing inputs')
    const user = await User.findById(_id).select('cart')
    const alreadyProduct = user?.cart?.find(el => el.product.toString()===pid)
    if(alreadyProduct){
        if(alreadyProduct.size === size){
            const response = await User.updateOne({cart:{$elemMatch:alreadyProduct}},{$set: {"cart.$.quantity": quantity}},{new:true})
            return res.status(200).json({
                success:response? true :false,
                updateUser: response ? response: 'Something went wrong'
            })
        }else{
            const response = await User.findByIdAndUpdate(_id,{$push: { cart: {product: pid, quantity, size}}},{new:true})    
            return res.status(200).json({
                success:response? true :false,
                updateUser: response ? response: 'Something went wrong'
            })
        }
    }else{
        const response = await User.findByIdAndUpdate(_id,{$push: { cart: {product: pid, quantity, size}}},{new:true})    
        return res.status(200).json({
            success:response? true :false,
            updateUser: response ? response: 'Something went wrong'
        })
}
})


module.exports ={
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    updateUserAddress,
    updateCart
   
}