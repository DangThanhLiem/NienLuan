const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const { type } = require('os');
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user',
    },
    cart:[{
      product:{type: mongoose.Types.ObjectId, ref: 'Product'},
      quantity:Number,
      size:String,
        
    }],
    wishlist:[{
        type:mongoose.Types.ObjectId,ref : 'Product'
    }],
    address:String,
    isBlocked:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String,
    },
    passwordChangeAt:{
        type:Date
    },
    passwordResetToken:{
        type:String
    },
    passwordResetExpires:{
        type:Date
    }
},{timestamps:true
});
// firstName: Tên của người dùng 
// lastName: Họ của người dùng 
// email: Địa chỉ email của người dùng 
// mobile: Số điện thoại di động của người dùng 
// password: Mật khẩu của người dùng 
// role: Vai trò của người dùng 
// isBlocked: Trạng thái khóa tài khoản của người dùng 
// refreshToken: Refresh token của người dùng 
// passwordChangeAt: Thời điểm người dùng thay đổi mật khẩu gần nhất 
// passwordResetToken: Mã thông báo để đặt lại mật khẩu của người dùng 
// passwordResetExpires: Thời gian hết hạn của mã thông báo đặt lại mật khẩu 
//Access token => Xac thuc va phan quyen nguoi dung 
// Hàm hash mật khẩu trước khi lưu vào cơ sở dữ liệu
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next()
    }
    const salt = await bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password,salt)
    next();
})
userSchema.methods = {
    isCorrectPassword:async function(password){
        return await bcrypt.compare(password, this.password)
    },
    // Hàm hash mã thông báo đặt lại mật khẩu trước khi lưu vào cơ sở dữ liệu
    createPasswordChangedToken: function(){
        const resetToken = crypto.randomBytes(32).toString('hex')
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        this.passwordResetExpires = Date.now() + 15*60*1000
        return resetToken
    }
}

//Export the model
module.exports = mongoose.model('User', userSchema);