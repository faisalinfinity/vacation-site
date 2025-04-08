import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Provider from "@/models/Provider";
import jwt from "jsonwebtoken";
import admin from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    // Expect an idToken from the client generated via Firebase Auth during login.
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;
    if (!email) {
      return NextResponse.json({ error: "Email not available in token" }, { status: 400 });
    }

    // Find provider. Optionally, if the provider doesn't exist, you could create a record.
    let provider = await Provider.findOne({ email });
    if (!provider) {
      provider = await Provider.create({
        name: name || "",
        email,
        password: "", // Not needed when using Firebase.
        uid,
      });
    }

    // Generate a custom JWT token for your server-side session if needed.
    const token = jwt.sign(
      { id: provider._id, email: provider.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
