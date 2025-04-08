"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth, createUserWithEmailAndPassword, updateProfile, getIdToken } from "firebase/auth";
import "@/lib/firebaseClient"; // Ensure Firebase is initialized

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const auth = getAuth();
      // Create user in Firebase Authentication.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile with the provided display name.
      await updateProfile(user, { displayName: name });

      // Force refresh the token and get the ID token.
      const idToken = await getIdToken(user, true);

      // Call the Next.js signup API endpoint with the Firebase idToken.
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        // After successful signup via your backend, redirect to login.
        router.push("/auth/login");
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Register</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-center text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="block mb-1">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="email" className="block mb-1">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="password" className="block mb-1">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="block mb-1">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">Register</Button>
          </form>
          <p className="mt-4 text-center">
            Already have an account?{" "}
            <a href="/auth/login" className="text-blue-600 hover:underline">Login</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
