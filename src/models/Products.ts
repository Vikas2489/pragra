// models/Product.ts
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },
});

export default mongoose.models.Product ||
  mongoose.model('Product', productSchema);