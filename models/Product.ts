// /models/Product.ts
import mongoose, { Document, Model } from "mongoose";

export interface IInventory {
  date: Date;
  available: boolean;
}

export interface IProduct extends Document {
  provider: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  price: number;
  images: string[];
  inventory: IInventory[];
}

const InventorySchema = new mongoose.Schema<IInventory>({
  date: { type: Date },
  available: { type: Boolean, default: true },
});

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: [{ type: String }],
    inventory: [InventorySchema],
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
