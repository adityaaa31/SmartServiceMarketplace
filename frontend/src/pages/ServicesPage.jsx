import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchServices, setFilters, clearFilters } from '../redux/slices/servicesSlice'
import { fetchCategories } from '../redux/slices/categoriesSlice'
import ServiceCard from '../components/services/ServiceCard'
import { SkeletonGrid } from '../components/common/SkeletonCard'
import Pagination from '../components/common/Pagination'

const ServicesPage = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { services, loading, pagination, filters } = useSelector(state => state.services)
  const { categories } = useSelector(state => state.categories)
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
  })
  const [page, setPage] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page,
      size: 12,
      ...(localFilters.search && { search: localFilters.search }),
      ...(localFilters.categoryId && { categoryId: localFilters.categoryId }),
      ...(localFilters.minPrice && { minPrice: localFilters.minPrice }),
      ...(localFilters.maxPrice && { maxPrice: localFilters.maxPrice }),
      ...(localFilters.minRating && { minRating: localFilters.minRating }),
      sortBy: localFilters.sortBy,
      sortDir: localFilters.sortDir,
    }
    dispatch(fetchServices(params))
  }, [dispatch, page, localFilters])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
  }

  const handleCategoryClick = (id) => {
    setLocalFilters(f => ({ ...f, categoryId: f.categoryId == id ? '' : id }))
    setPage(0)
  }

  const handleClearFilters = () => {
    setLocalFilters({ search: '', categoryId: '', minPrice: '', maxPrice: '', minRating: '', sortBy: 'createdAt', sortDir: 'desc' })
    setPage(0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
        <p className="text-gray-500 mt-1">{pagination.totalElements} services available</p>
      </div>

      {/* Search + Sort bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={localFilters.search}
            onChange={e => setLocalFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search services..."
            className="input-field pl-10"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={`${localFilters.sortBy}-${localFilters.sortDir}`}
          onChange={e => {
            const [sortBy, sortDir] = e.target.value.split('-')
            setLocalFilters(f => ({ ...f, sortBy, sortDir }))
          }}
          className="input-field w-auto"
        >
          <option value="createdAt-desc">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="averageRating-desc">Top Rated</option>
          <option value="totalBookings-desc">Most Popular</option>
        </select>
        <button type="button" onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
        </button>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Price ($)</label>
            <input type="number" value={localFilters.minPrice}
              onChange={e => setLocalFilters(f => ({ ...f, minPrice: e.target.value }))}
              placeholder="0" className="input-field" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Price ($)</label>
            <input type="number" value={localFilters.maxPrice}
              onChange={e => setLocalFilters(f => ({ ...f, maxPrice: e.target.value }))}
              placeholder="Any" className="input-field" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Rating</label>
            <select value={localFilters.minRating}
              onChange={e => setLocalFilters(f => ({ ...f, minRating: e.target.value }))}
              className="input-field">
              <option value="">Any</option>
              {[4.5, 4, 3.5, 3].map(r => (
                <option key={r} value={r}>{r}+ ★</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button onClick={handleClearFilters} className="text-sm text-red-500 hover:text-red-700 font-medium">
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => handleCategoryClick('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !localFilters.categoryId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              localFilters.categoryId == cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <SkeletonGrid count={12} />
      ) : services.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          <button onClick={handleClearFilters} className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <Pagination
            currentPage={pagination.number}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}

export default ServicesPage
