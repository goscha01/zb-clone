import { useState } from "react"
import { Link } from "react-router-dom"

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add your sign-in logic here
    console.log("Sign in attempt:", { email, password })
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (emailError) {
      setEmailError(false)
    }
  }

  const handleForgotPassword = () => {
    // Add forgot password logic here
    console.log("Forgot password clicked")
  }

  const handleSignUp = () => {
    // Add sign up navigation logic here
    console.log("Sign up clicked")
  }

  const isFormValid = email.trim() !== "" && password.trim() !== ""

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex justify-center mb-8">
             <Link href="/" className="flex items-center">
            <img src="/images/zenbooker-logo-v3.1-mobile.svg" alt="Zenbooker" className="h-10 w-auto" />
          </Link>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  emailError ? "border-red-500 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
                }`}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors"
                required
              />
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isFormValid
                    ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>

        {/* Sign Up Section */}
        <div className="text-center">
          <span className="text-gray-600 text-sm">
            {"Don't have an account? "}
            <button onClick={handleSignUp} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Sign Up
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}
