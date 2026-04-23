import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import CustomerDashboard from '../components/dashboard/CustomerDashboard'
import ProviderDashboard from '../components/dashboard/ProviderDashboard'

const DashboardPage = () => {
  const { user } = useSelector(state => state.auth)

  if (user?.role === 'PROVIDER') return <ProviderDashboard />
  return <CustomerDashboard />
}

export default DashboardPage
