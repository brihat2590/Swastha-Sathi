"use client";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<null | "github" | "google">(null);
  
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
            disabled={loading || socialLoadingProvider !== null}
          >
            {socialLoadingProvider === "github" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FaGithub className="text-2xl" />} {socialLoadingProvider === "github" ? "Logging you in..." : "GitHub"}
          </button>
          <button
            className="w-full border border-gray-300 rounded-lg py-2 flex justify-center items-center gap-2 hover:bg-gray-200 hover:scale-[1.03] transition-all shadow-sm"
            onClick={handleGoogleSignup}
            disabled={loading || socialLoadingProvider !== null}
          >
            {socialLoadingProvider === "google" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FcGoogle className="text-2xl" />} {socialLoadingProvider === "google" ? "Logging you in..." : "Google"}
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
              const handleSignup = async (e: React.FormEvent) => {
                e.preventDefault();
                const toastId = toast.loading("Creating your account...");

                try {
                  setLoading(true);
                  const { error } = await authClient.signUp.email({
                    email,
                    password,
                    name,
                    callbackURL: "/sign-in",
                  });

                  if (error) {
                    toast.error(error.message || "Unable to create account. Please try again.", { id: toastId });
                    return;
                  }

                  toast.success("Account created. Please log in.", { id: toastId });
                  router.push("/sign-in");
                } catch {
                  toast.error("Unable to create account right now. Please try again.", { id: toastId });
                } finally {
                  setLoading(false);
                }
              };

              const handleGoogleSignup = async () => {
                const toastId = "social-google-signup";

                try {
                  setSocialLoadingProvider("google");
                  toast.loading("Creating account with Google...", { id: toastId });

                  await authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard",
                    errorCallbackURL: "/error",
                    newUserCallbackURL: "/dashboard",
                  });

                  toast.success("Logged in. Redirecting to Google...", { id: toastId });
                } catch {
                  toast.error("Google sign up failed. Please try again.", { id: toastId });
                  setSocialLoadingProvider(null);
                }
              };

              const handleGithubSignup = async () => {
                const toastId = "social-github-signup";

                try {
                  setSocialLoadingProvider("github");
                  toast.loading("Creating account with GitHub...", { id: toastId });

                  await authClient.signIn.social({
                    provider: "github",
                    callbackURL: "/dashboard",
                    errorCallbackURL: "/error",
                    newUserCallbackURL: "/dashboard",
                  });

                  toast.success("Logged in. Redirecting to GitHub...", { id: toastId });
                } catch {
                  toast.error("GitHub sign up failed. Please try again.", { id: toastId });
                  setSocialLoadingProvider(null);
                }
              };