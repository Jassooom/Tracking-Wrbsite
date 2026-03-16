import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import Map from '../components/Map'
import VehicleList from '../components/VehicleList'
import AlertPanel from '../components/AlertPanel'

export default function Home() {
  const [vehicles, setVehicles] = useState([])
  const [alerts, setAlerts] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  useEffect(() => {
    // Connect to socket.io
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000')

    socket.on('location-update', (data) => {
      setVehicles(prev => prev.map(vehicle => 
        vehicle._id === data.vehicleId ? { ...vehicle, lastLocation: data.location } : vehicle
      ))
    })

    socket.on('alert', (alert) => {
      setAlerts(prev => [alert, ...prev])
    })

    // Fetch initial data
    fetchVehicles()
    fetchAlerts()

    return () => socket.disconnect()
  }, [])

  const fetchVehicles = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const res = await fetch('/api/vehicles', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setVehicles(data)
  }

  const fetchAlerts = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const res = await fetch('/api/alerts', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setAlerts(data)
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Vehicle Tracking Dashboard</h1>
      </header>
      
      <div className="flex-1 flex">
        <div className="w-1/4 bg-gray-100 p-4">
          <VehicleList 
            vehicles={vehicles} 
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
          />
          <AlertPanel alerts={alerts} />
        </div>
        
        <div className="flex-1">
          <Map vehicles={vehicles} selectedVehicle={selectedVehicle} />
        </div>
      </div>
    </div>
  )
}