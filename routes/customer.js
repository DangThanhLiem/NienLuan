const router = require('express').Router()
const ctrls = require('../controllers/customer')
const {verifyAccessToken, isAdmin} = require('../middlewares/verifyToken')

router.post('/',[verifyAccessToken],ctrls.createNewCustomer)
router.get('/',[verifyAccessToken,isAdmin],ctrls.getCustomers)
router.delete('/',[verifyAccessToken,isAdmin],ctrls.deleteCustomer)
router.put('/:cid',[verifyAccessToken],ctrls.updateCustomers)
router.put('/:customerId/cart',[verifyAccessToken],ctrls.updateCart)

module.exports = router

//CRUD
//C + P = body
//G + D = query