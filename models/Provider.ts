// /models/Provider.ts
import mongoose, { Document, Model } from "mongoose";

export interface IProvider extends Document {
  name: string;
  email: string;
  password: string;
}

const ProviderSchema = new mongoose.Schema<IProvider>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Provider: Model<IProvider> =
  mongoose.models.Provider || mongoose.model<IProvider>("Provider", ProviderSchema);

export default Provider;
