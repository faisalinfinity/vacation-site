import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();
    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    // Find products where there's at least one inventory date
    // within the next 14 days that is available = true.
    const products = await Product.find({
      inventory: {
        $elemMatch: {
          date: { $gte: now, $lte: twoWeeksFromNow },
          available: true,
        },
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
