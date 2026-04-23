import React from 'react'

const LoadingSpinner = ({ fullScreen, size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className={`${sizes.lg} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto`} />
          <p className="mt-4 text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
    </div>
  )
}

export default LoadingSpinner
