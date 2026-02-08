import React, { useState } from "react";
import { Sparkles, Mail, Lock, User } from "lucide-react";

export default function Login({ onLoginSuccess }) {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
        const payload = isRegister
            ? { email, password, name }
            : { email, password };

        try {
            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Authentication failed");
            }

            const data = await response.json();
            localStorage.setItem("token", data.access_token);

            // Fetch user info
            const userResponse = await fetch("http://localhost:8000/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${data.access_token}`,
                },
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                onLoginSuccess(userData, data.access_token);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0f0f2a] to-[#0a0a1a]">
            <div className="w-full max-w-md p-8">
                {/* Logo/Icon */}
                <div className="flex justify-center mb-8">
                    
                </div>

                {/* Title */}
                <h1 className="text-3xl font-semibold text-white text-center mb-2">
                    {isRegister ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="text-gray-500 text-center mb-8">
                    {isRegister
                        ? "Sign up to start creating stories"
                        : "Sign in to continue your stories"}
                </p>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 border border-red-600/40 bg-red-600/10 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field (Register Only) */}
                    {isRegister && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Name
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-blue-900/10 border border-blue-900/30 rounded-lg text-white text-sm outline-none focus:border-blue-500/50 focus:bg-blue-900/20 transition"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                                size={18}
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-blue-900/10 border border-blue-900/30 rounded-lg text-white text-sm outline-none focus:border-blue-500/50 focus:bg-blue-900/20 transition"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                                size={18}
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-blue-900/10 border border-blue-900/30 rounded-lg text-white text-sm outline-none focus:border-blue-500/50 focus:bg-blue-900/20 transition"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? "Please wait..."
                            : isRegister
                                ? "Create Account"
                                : "Sign In"}
                    </button>
                </form>

                {/* Toggle Register/Login */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError("");
                        }}
                        className="text-white hover:underline"
                    >
                        {isRegister ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
