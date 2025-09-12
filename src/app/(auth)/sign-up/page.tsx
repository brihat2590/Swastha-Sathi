"use client";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import { TbPassword } from "react-icons/tb";
import { CgCloseR } from "react-icons/cg";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const[name,setName]=useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);

  const handleSignup = async (e: React.FormEvent) => { 
    
    e.preventDefault();
    setLoading(true);
    const { data, error } = await authClient.signUp.email({
        email, // user email address
        password, // user password -> min 8 characters by default
        name, // user display name
     
        callbackURL: "/sign-in" // A URL to redirect to after the user verifies their email (optional)
    }, {
        onRequest: (ctx) => {
            //show loading
        },
        onSuccess: (ctx) => {
            //redirect to the dashboard or sign in page
            setLoading(false)
            redirect("/sign-in");
        },
        onError: (ctx) => {
            // display the error message
            alert(ctx.error.message);
        },
});


    
    
    
    /* your logic here */ };
  const handleGoogleSignup = async () => {
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
  const handleGithubSignup = async () => { /* your logic here */

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
        
    });
   };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-white px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 transition-all">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 drop-shadow-lg">SwasthaSathi</h1>
        <h2 className="text-2xl font-bold text-center text-gray-900 mt-3">Welcome</h2>
        <p className="text-sm text-center text-gray-500 mt-1">Please enter your details to sign up</p>

        {/* Social Signup */}
        <div className="flex items-center gap-4 mt-7">
          <button
            className="w-full border border-gray-300 rounded-lg py-2 flex justify-center items-center gap-2 hover:bg-gray-200 hover:scale-[1.03] transition-all shadow-sm"
            onClick={handleGithubSignup}
          >
            <FaGithub className="text-2xl" /> GitHub
          </button>
          <button
            className="w-full border border-gray-300 rounded-lg py-2 flex justify-center items-center gap-2 hover:bg-gray-200 hover:scale-[1.03] transition-all shadow-sm"
            onClick={handleGoogleSignup}
          >
            <FcGoogle className="text-2xl" /> Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 my-7">
          <hr className="flex-grow border-t-2 border-gray-300" />
          <span className="bg-white px-3 rounded-full text-gray-400 text-xs font-medium shadow-sm">OR</span>
          <hr className="flex-grow border-t-2 border-gray-300" />
        </div>

        {/* Sign up form */}
        <form className="space-y-5" onSubmit={handleSignup}>
        <input
            type="text"
            autoComplete="name"
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 placeholder-gray-400 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <input
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 placeholder-gray-400 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 placeholder-gray-400 transition-all pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-indigo-400 hover:text-indigo-600 transition-all text-lg"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ?<Eye/>  :<EyeOff/> }
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold shadow-md transition-all ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-indigo-700 hover:scale-[1.02]"}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"></path>
                </svg>
                Signing up...
              </div>
            ) : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-7">
          Already have an account?{" "}
          <a href="/sign-in" className="text-indigo-600 hover:underline hover:text-indigo-800 font-medium">Sign in</a>
        </p>
      </div>
    </div>
  );
}