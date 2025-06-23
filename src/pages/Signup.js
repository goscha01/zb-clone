import { useState } from "react"
import { Link } from "react-router-dom"
// import { Button } from "../components/ui/button"
// import { Input } from "../components/ui/input"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", { email, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002D7A] to-[#002D7A] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Left side - Form */}
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="flex items-center">
                         <img src="/images/zenbooker-logo-v3.1-mobile.svg" alt="Zenbooker" className="h-10 w-auto" />
                       </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Start your free trial</h1>
              <div className="w-32 h-2 bg-green-400 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Try Zenbooker free for 14 days.
                <br />
                No credit card required.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Your business email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">Password must be at least 8 characters</p>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold text-base rounded-lg transition-colors duration-200"
              >
                Continue
              </button>
            </form>

            {/* Sign in link */}
            <div className="text-center mt-6">
              <span className="text-gray-600 text-sm">Already using Zenbooker? </span>
              <button className="text-blue-200 hover:text-blue-100 text-sm font-semibold transition-colors duration-200">
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Background Image */}
        <div className="hidden lg:block w-full max-w-lg">
          <div className="relative">
            <img
              src="/images/signup-bg.avif"
              alt="Zenbooker Dashboard"
              className="w-full h-auto rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
