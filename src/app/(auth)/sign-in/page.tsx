"use client";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const router = useRouter();

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const { data, error } = await authClient.signIn.email({
      /**
       * The user email
       */
      email,
      /**
       * The user password
       */
      password,
      /**
       * A URL to redirect to after the user verifies their email (optional)
       */
      callbackURL: "/dashboard",
      /**
       * remember the user session after the browser is closed. 
       * @default true
       */
      rememberMe: false
}, {
  //callbacks
})
setLoading(false);

    
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      /**
       * The social provider ID
       * @example "github", "google", "apple"
       */
      provider: "google",
      /**
       * A URL to redirect after the user authenticates with the provider
       * @default "/"
       */
      callbackURL: "/dashboard", 
      /**
       * A URL to redirect if an error occurs during the sign in process
       */
      errorCallbackURL: "/error",
      /**
       * A URL to redirect if the user is newly registered
       */
      newUserCallbackURL: "/dashboard",
      /**
       * disable the automatic redirect to the provider. 
       * @default false
       */
      
  }); /* your logic here */

    
  };

  const handleGithubLogin = async () => {
    await authClient.signIn.social({
      /**
       * The social provider ID
       * @example "github", "google", "apple"
       */
      provider: "github",
      /**
       * A URL to redirect after the user authenticates with the provider
       * @default "/"
       */
      callbackURL: "/dashboard", 
      /**
       * A URL to redirect if an error occurs during the sign in process
       */
      errorCallbackURL: "/error",
      /**
       * A URL to redirect if the user is newly registered
       */
      newUserCallbackURL: "/dashboard",
      /**
       * disable the automatic redirect to the provider. 
       * @default false
       */
      
  }); /* your logic here */

  
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-extrabold text-center text-indigo-600">
        Swastha Sathi
        </h1>
        <h2 className="text-2xl font-bold text-center text-black mt-2">Login</h2>
        <p className="text-sm text-center text-gray-500 mt-1">
          Access your account by logging in below
        </p>

        {/* Social Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleGithubLogin}
            className="w-full border border-gray-300 rounded-lg py-2 flex justify-center items-center gap-2 hover:bg-gray-100"
          >
            <FaGithub className="text-xl" />
            GitHub
          </button>
          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 rounded-lg py-2 flex justify-center items-center gap-2 hover:bg-gray-100"
          >
            <FcGoogle className="text-xl" />
            Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Email / Password Login */}
        <form className="space-y-4" onSubmit={handleEmailLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <Eye/> :<EyeOff/> }
            </button>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <label className="flex items-center gap-1">
              <input type="checkbox" className="accent-indigo-600" />
              Remember me
            </label>
            <a href="#" className="text-indigo-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-2 rounded-lg transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"
                  ></path>
                </svg>
                Logging in...
              </div>
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <a href="/sign-up" className="text-indigo-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}