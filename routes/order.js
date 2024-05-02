const router = require('express').Router()
const ctrls = require('../controllers/order')

const {verifyAccessToken, isAdmin} = require('../middlewares/verifyToken')

router.post('/',[verifyAccessToken],ctrls.createOrder)
router.get('/',verifyAccessToken,ctrls.getUserOrder)
router.get('/admin',[verifyAccessToken,isAdmin],ctrls.getOrders)
router.put('/status/:oid',[verifyAccessToken, isAdmin],ctrls.updateStatus)
// router.delete('/:cid',[verifyAccessToken, isAdmin],ctrls.deleteCoupon)


module.exports = router