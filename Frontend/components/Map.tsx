import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'your-mapbox-token'

export default function Map({ vehicles, selectedVehicle }) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return // initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9
    })

    // Add markers for vehicles
    vehicles.forEach(vehicle => {
      if (vehicle.lastLocation) {
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