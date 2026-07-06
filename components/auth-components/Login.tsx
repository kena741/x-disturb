"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, Loader2 } from "lucide-react";

import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { session } from "@/lib/sessionStorage";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

  useEffect(() => {
    if (session.getItem("isAuthenticated")) {
      router.push("/dashboard");
    }
  }, [router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await signInWithEmailAndPassword(
        formData.email,
        formData.password
      );
      
      if (res) {
        session.setItem("isAuthenticated", true);
        session.setItem("userId", res.user.uid);
        session.setItem("accessToken", await res.user.getIdToken());
      }
      console.log({ res });
      router.push("/dashboard");
    } catch (err) {
      console.log(err);
    }

    console.log("Login Data:", formData);
    // fake delay for loader
    await new Promise((res) => setTimeout(res, 500));
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-none border border-gray-200 dark:border-gray-800">
        <CardContent className="p-0">
          <h2 className="text-center text-xl font-semibold text-black dark:text-white mb-6">
            Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label
                htmlFor="email"
                className="text-black dark:text-white mb-2 block text-sm font-medium"
              >
                Username or email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 h-11 border border-gray-200 dark:border-gray-800 rounded-md bg-[#f9f9f9] dark:bg-[#1e1e1e] text-black dark:text-white focus:outline-none focus:ring-0 focus:border-gray-300"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-black dark:text-white mb-2 block text-sm font-medium"
              >
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11 border border-gray-200 dark:border-gray-800 rounded-md bg-[#f9f9f9] dark:bg-[#1e1e1e] text-black dark:text-white focus:outline-none focus:ring-0 focus:border-gray-300"
                />
                <EyeIcon
                  className="absolute right-3 top-3 h-5 w-5 text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <p className="text-center text-sm text-primary mt-2 cursor-pointer">
              Forgot your password?
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
