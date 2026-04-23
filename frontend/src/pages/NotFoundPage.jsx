import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="text-8xl font-extrabold text-blue-600 mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary px-8 py-3 text-base">Go Home</Link>
    </div>
  </div>
)

export default NotFoundPage
