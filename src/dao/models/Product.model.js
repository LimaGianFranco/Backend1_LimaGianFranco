import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  code: { type: String, required: true, unique: true },
  price: Number,
  status: { type: Boolean, default: true },
  stock: Number,
  category: String,
});

export const ProductModel = mongoose.model('Product', productSchema);
