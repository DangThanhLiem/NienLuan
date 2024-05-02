const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  cart:[{
    product:{type: mongoose.Types.ObjectId,ref: 'Product'},
    quantity:Number,
}]
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;