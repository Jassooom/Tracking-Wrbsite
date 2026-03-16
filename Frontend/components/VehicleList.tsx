export default function VehicleList({ vehicles, selectedVehicle, onSelectVehicle }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Vehicles</h2>
      <div className="space-y-2">
        {vehicles.map(vehicle => (
          <div 
            key={vehicle._id}
            className={`p-2 border rounded cursor-pointer ${
              selectedVehicle?._id === vehicle._id ? 'bg-blue-100 border-blue-300' : 'bg-white'
            }`}
            onClick={() => onSelectVehicle(vehicle)}
          >
            <h3 className="font-medium">{vehicle.name}</h3>
            <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
            <p className="text-xs text-gray-500">Status: {vehicle.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}