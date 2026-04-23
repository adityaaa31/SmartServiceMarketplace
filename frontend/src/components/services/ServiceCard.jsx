import React from 'react'
import { Link } from 'react-router-dom'
import StarRating from '../common/StarRating'

const ServiceCard = ({ service }) => {
  const defaultImage = `https://picsum.photos/seed/${service.id}/400/250`

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="relative overflow-hidden h-48">
        <img
          src={service.imageUrl || defaultImage}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = defaultImage }}
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            {service.categoryName}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {service.title}
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">{service.providerName?.[0]}</span>
          </div>
          <span className="text-xs text-gray-500">{service.providerName}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={service.averageRating} size="sm" />
          <span className="text-xs text-gray-500">
            {service.averageRating?.toFixed(1)} ({service.totalReviews})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Starting at</span>
            <p className="text-lg font-bold text-gray-900">${service.price}</p>
          </div>
          <Link
            to={`/services/${service.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
