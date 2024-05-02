const router = require('express').Router()
const ctrls = require('../controllers/user')
const {verifyAccessToken, isAdmin} = require('../middlewares/verifyToken')

// Đăng ký người dùng mới
router.post('/register',ctrls.register)
// Đăng nhập
router.post('/login',ctrls.login)
// Lấy thông tin người dùng hiện tại
router.get('/current',verifyAccessToken,ctrls.getCurrent)
// Làm mới access token
router.post('/refreshToken',ctrls.refreshAccessToken)
// Đăng xuất
router.get('/logout',ctrls.logout)
// Quên mật khẩu
router.get('/forgotPassword',ctrls.forgotPassword)
// Đặt lại mật khẩu
router.put('/resetpassword',ctrls.resetPassword)
// Lấy danh sách người dùng
router.get('/',[verifyAccessToken,isAdmin],ctrls.getUsers)
// Xóa người dùng
router.delete('/',[verifyAccessToken,isAdmin],ctrls.deleteUser)
// Cập nhật thông tin người dùng
router.put('/current',[verifyAccessToken],ctrls.updateUser)
// Cập nhật địa chỉ người dùng
router.put('/address',[verifyAccessToken],ctrls.updateUserAddress)
// Cập nhật cart người dùng
router.put('/cart',[verifyAccessToken],ctrls.updateCart)
// Cập nhật thông tin người dùng bởi admin
router.put('/:uid',[verifyAccessToken,isAdmin],ctrls.updateUserByAdmin)



module.exports = router

//CRUD
//C + P = body
//G + D = query