import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../redux/slices/categoriesSlice'
import { fetchServices } from '../redux/slices/servicesSlice'
import ServiceCard from '../components/services/ServiceCard'
import { SkeletonGrid } from '../components/common/SkeletonCard'

const HERO_STATS = [
  { label: 'Services', value: '500+' },
  { label: 'Providers', value: '200+' },
  { label: 'Happy Customers', value: '10K+' },
  { label: 'Cities', value: '50+' },
]

const HomePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { categories } = useSelector(state => state.categories)
  const { services, loading } = useSelector(state => state.services)
  const [search, setSearch] = React.useState('')

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchServices({ size: 8, sortBy: 'totalBookings', sortDir: 'desc' }))
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/services?search=${encodeURIComponent(search)}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Find Trusted Services
              <span className="block text-blue-200">Near You</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Connect with skilled professionals for home services, repairs, and more. Book instantly, pay securely.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="What service are you looking for?"
                className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
              />
              <button type="submit"
                className="bg-white text-blue-600 font-bold px-6 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap">
                Search
              </button>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14">
              {HERO_STATS.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 mt-2">Find the right professional for every job</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/services?categoryId=${cat.id}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <span className="text-3xl">{cat.icon || '🔧'}</span>
                <span className="text-xs font-medium text-gray-700 text-center group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services - only shown when services exist */}
      {(loading || services.length > 0) && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Popular Services</h2>
                <p className="text-gray-500 mt-1">Most booked services this month</p>
              </div>
              <Link to="/services" className="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                View All →
              </Link>
            </div>
            {loading ? (
              <SkeletonGrid count={8} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {services.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-2">Get started in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🔍', title: 'Browse Services', desc: 'Explore hundreds of services across categories. Filter by price, rating, and location.' },
              { step: '02', icon: '📅', title: 'Book Instantly', desc: 'Choose your preferred date and time. Get instant confirmation from the provider.' },
              { step: '03', icon: '⭐', title: 'Rate & Review', desc: 'After service completion, share your experience to help others make better choices.' },
            ].map(item => (
              <div key={item.step} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="text-xs font-bold text-blue-600 mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Are You a Service Provider?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of professionals earning on SmartService. List your services and grow your business.</p>
          <Link to="/register"
            className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            Start Earning Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-lg">SmartService</span>
          </div>
          <p className="text-sm">© 2024 SmartService Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
