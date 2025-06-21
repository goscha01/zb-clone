"use client"

import { useState } from "react"
import {Link} from 'react-router-dom'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/images/zenbooker-logo-v3.1-mobile.svg" alt="Zenbooker" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("product")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Product
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === "product" && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                  <div className="space-y-4">
                    <Link href="/online-booking" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Online Booking</h3>
                        <p className="text-sm text-gray-500">Let customers book services 24/7</p>
                      </div>
                    </Link>

                    <Link
                      href="/service-requests"
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Service Requests</h3>
                        <p className="text-sm text-gray-500">Let customers request quotes or bookings</p>
                      </div>
                    </Link>

                    <Link href="/invoicing" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Invoicing</h3>
                        <p className="text-sm text-gray-500">Send invoices & payment links</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/pricing"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Pricing
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("resources")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Resources
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === "resources" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="space-y-2">
                    <Link href="/help" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      Help Center
                    </Link>
                    <Link
                      href="/changelog"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Product Updates
                    </Link>
                    <Link
                      href="/developers"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Developers
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link href="/features" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                Features
              </Link>
              <Link href="/pricing" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                Pricing
              </Link>
              <Link href="/help" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                Help
              </Link>
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                  Sign In
                </Link>
                <Link href="/signup" className="block bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
