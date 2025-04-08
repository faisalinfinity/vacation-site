import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Provider from "@/models/Provider";
import admin from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    // Expect an idToken from the client generated via Firebase Auth during signup.
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify the token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;
    if (!email) {
      return NextResponse.json({ error: "Email not available in token" }, { status: 400 });
    }

    // Check if the provider already exists
    const existing = await Provider.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Provider already exists" }, { status: 400 });
    }

    // Create a new provider record using the verified Firebase user data.
    // You can store the UID instead of a password.
    await Provider.create({
      name: name || "",
      email,
      password: "", // Not used if you're relying on Firebase authentication.
      uid, // Optionally store the Firebase UID.
    });

    return NextResponse.json({ message: "Provider created successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
