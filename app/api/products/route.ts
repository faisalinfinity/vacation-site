// /app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyToken } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Filter products by provider ID from the JWT token.
    const products = await Product.find({ provider: decoded.id });
    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const body = await request.json();
    const { title, description, price, images, inventory } = body;

    if (!title || !price) {
      return NextResponse.json({ error: "Title and Price are required" }, { status: 400 });
    }

    const product = await Product.create({
      provider: decoded.id,
      title,
      description,
      price,
      images,
      inventory,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
