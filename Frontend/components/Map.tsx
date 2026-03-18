import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'your-mapbox-token'

type Vehicle = {
  _id: string
  name: string
  lastLocation?: {
    lat: number
    lng: number
    timestamp: string
  }
}

type MapProps = {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
}

export default function Map({ vehicles, selectedVehicle }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return // initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9
    })

    // Add markers for vehicles
    vehicles.forEach(vehicle => {
      if (vehicle.lastLocation && map.current) {
        new mapboxgl.Marker()
          .setLngLat([vehicle.lastLocation.lng, vehicle.lastLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${vehicle.name}</h3>`))
          .addTo(map.current)
      }
    })
  }, [vehicles])

  useEffect(() => {
    if (!map.current || !selectedVehicle?.lastLocation) return
    
    map.current.flyTo({
      center: [selectedVehicle.lastLocation.lng, selectedVehicle.lastLocation.lat],
      zoom: 15
    })
  }, [selectedVehicle])

  return <div ref={mapContainer} className="h-full w-full" />
}