import React from 'react'

const StarRating = ({ rating, maxStars = 5, size = 'sm', interactive = false, onChange }) => {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }

  return (
    <div className={`flex items-center gap-0.5 ${sizes[size]}`}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
            i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => interactive && onChange && onChange(i + 1)}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default StarRating
