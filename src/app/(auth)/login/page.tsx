"use client";
import React, { useState } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaGoogle,
  FaRegEye,
  FaRegEyeSlash,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import { signIn } from "@/lib/auth-client";
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Handle input field changes dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Google Social Authentication
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/", 
      });
    } catch (err) {
      setLoading(false);
      toast.error("Google login failed. Please try again.");
      console.error("Google Auth Error:", err);
    }
  };

  // Handle standard credentials form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn.email(
        {
          email: formData.email,
          password: formData.password,
          callbackURL: "/",
        },
        {
          onRequest: () => setLoading(true),
          onSuccess: () => {
            setLoading(false);
            toast.success("Sign In Successful! Welcome back.", {
              duration: 3000,
            });

            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 2000);
          },
          onError: (ctx) => {
            setLoading(false);
            toast.error(ctx.error.message || "Invalid email or password.", {
              duration: 3000,
            });
          },
        },
      );
    } catch (err) {
      setLoading(false);
      toast.error("An unexpected error occurred during login.", {
        duration: 3000,
      });
      console.error(err);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-[#243239] px-4 py-12"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="w-full max-w-md bg-[#2f3f48] rounded-2xl shadow-2xl border border-white/10 p-8 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <NextLink
            href="/"
            className="inline-flex items-center gap-2.5 justify-center group"
          >
            <Image
              src="/Images/ArtHubLogo.png"
              alt="ArtHub Logo"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-2xl font-bold tracking-tight text-white">
              Art<span className="text-[#df6742]">Hub</span>
            </span>
          </NextLink>
          <h2 className="text-xl font-bold text-white pt-2">Welcome Back!</h2>
          <p className="text-xs text-white/60">
            Log in to your account to explore and collect masterpieces.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address Input Field */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-white/70 text-xs font-semibold">
                Email Address
              </span>
            </label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <FaEnvelope className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                placeholder="yourname@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#df6742] transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input Field with Visibility Toggle */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-white/70 text-xs font-semibold">
                Password
              </span>
            </label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <FaLock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-11 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#df6742] transition-colors"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? (
                  <FaRegEyeSlash className="w-4 h-4" />
                ) : (
                  <FaRegEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#df6742] hover:bg-[#c55332] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#df6742]/10 mt-2 disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        {/* Divider Line */}
        <div className="relative flex py-2 items-center">
          <div className="grow border-t border-white/10"></div>
          <span className="shrink mx-4 text-white/40 text-xs font-semibold uppercase tracking-wider">
            or
          </span>
          <div className="grow border-t border-white/10"></div>
        </div>

        {/* OAuth Integration Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <FaGoogle className="w-4 h-4 text-white shrink-0" />
          <span>Continue with Google</span>
        </button>

        {/* Account Navigation Link */}
        <p className="text-center text-xs text-white/60 pt-2">
          Don&apos;t have an account?{" "}
          <NextLink
            href="/register"
            className="text-[#df6742] hover:underline font-bold"
          >
            Sign Up Here
          </NextLink>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;