// app/api/products/[id]/inventory/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const id= (await params).id
    const product = await Product.findById(id).select("inventory");
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ inventory: product.inventory }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params:  Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { inventory } = await request.json(); // inventory: Array<{ date: string, available: boolean }>
    const product = await Product.findById((await params).id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    product.inventory = inventory;
    await product.save();
    return NextResponse.json(
      { message: "Inventory updated successfully", inventory: product.inventory },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
