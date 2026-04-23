import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createService, updateService } from '../../redux/slices/servicesSlice'
import { servicesAPI } from '../../api/servicesAPI'
import axiosInstance from '../../api/axiosInstance'
import toast from 'react-hot-toast'

const ServiceForm = ({ service, categories, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    title: service?.title || '',
    description: service?.description || '',
    price: service?.price || '',
    categoryId: service?.categoryId || '',
    location: service?.location || '',
    deliveryTime: service?.deliveryTime || '',
    imageUrl: service?.imageUrl || '',
  })
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm(f => ({ ...f, imageUrl: res.data.data.url }))
      toast.success('Image uploaded')
    } catch (err) {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.price || !form.categoryId) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      const payload = { ...form, price: parseFloat(form.price), categoryId: parseInt(form.categoryId), deliveryTime: form.deliveryTime ? parseInt(form.deliveryTime) : null }
      if (service) {
        await dispatch(updateService({ id: service.id, data: payload })).unwrap()
        toast.success('Service updated!')
      } else {
        await dispatch(createService(payload)).unwrap()
        toast.success('Service created! Pending admin approval.')
      }
      onSuccess()
    } catch (err) {
      toast.error(err || 'Failed to save service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Professional Home Cleaning" className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Describe your service in detail..." rows={4} className="input-field resize-none" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($) *</label>
          <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            placeholder="99.99" className="input-field" min="1" step="0.01" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
          <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            className="input-field" required>
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
          <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="City, State" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Time (days)</label>
          <input type="number" value={form.deliveryTime} onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))}
            placeholder="1" className="input-field" min="1" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Image</label>
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="service-img" />
          <label htmlFor="service-img" className="btn-secondary cursor-pointer text-sm">
            {uploading ? 'Uploading...' : 'Upload Image'}
          </label>
          {form.imageUrl && (
            <img src={form.imageUrl} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
          )}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
        <button type="submit" disabled={loading || uploading} className="flex-1 btn-primary">
          {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </form>
  )
}

export default ServiceForm
