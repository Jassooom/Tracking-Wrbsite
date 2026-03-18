import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'
import Map from '../components/Map'
import VehicleList from '../components/VehicleList'
import AlertPanel from '../components/AlertPanel'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

type Vehicle = {
  _id: string
  name: string
  licensePlate: string
  status: string
  lastLocation?: {
    lat: number
    lng: number
    timestamp: string
  }
}

type Alert = {
  _id: string
  type: string
  message: string
  timestamp: string
}

export default function Home() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
      return
    }

    // Connect to socket.io
    const socket = io(BACKEND_URL)

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

    return () => {
      socket.disconnect()
    }
  }, [router]) // Added router to dependencies

  const fetchVehicles = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const res = await fetch(`${BACKEND_URL}/api/vehicles`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setVehicles(data)
  }

  const fetchAlerts = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const res = await fetch(`${BACKEND_URL}/api/alerts`, {
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