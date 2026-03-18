type Alert = {
  _id: string
  type: string
  message: string
  timestamp: string
}

export default function AlertPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Active Alerts</h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.slice(0, 10).map(alert => (
          <div key={alert._id} className="p-2 bg-red-50 border border-red-200 rounded">
            <h3 className="font-medium text-red-800">{alert.type.replace('-', ' ').toUpperCase()}</h3>
            <p className="text-sm text-red-700">{alert.message}</p>
            <p className="text-xs text-red-600">{new Date(alert.timestamp).toLocaleString()}</p>
          </div>
        ))}
        {alerts.length === 0 && (
          <p className="text-gray-500 text-sm">No active alerts</p>
        )}
      </div>
    </div>
  )
}