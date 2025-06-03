import React from 'react';
import { AlertTriangle } from 'lucide-react';

function SystemAlerts({ alerts }) {
    return (
        <div className="space-y-3">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className={`
                        flex items-center p-3 rounded-lg border
                        ${alert.severity === 'high' ? 'border-red-200 bg-red-50' :
                            alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                                'border-blue-200 bg-blue-50'}
                    `}
                >
                    <div className={`
                        p-2 rounded-full
                        ${alert.severity === 'high' ? 'bg-red-100' :
                            alert.severity === 'medium' ? 'bg-yellow-100' :
                                'bg-blue-100'}
                    `}>
                        <AlertTriangle size={18} className={`
                            ${alert.severity === 'high' ? 'text-red-600' :
                                alert.severity === 'medium' ? 'text-yellow-600' :
                                    'text-blue-600'}
                        `} />
                    </div>
                    <div className="ml-3">
                        <p className="font-medium">{alert.type}</p>
                        <p className="text-sm text-gray-600">{alert.station} • {alert.time}</p>
                    </div>
                </div>
            ))}
            <button className="w-full py-2 text-center text-sm text-blue-600 hover:text-blue-800">
                View All Alerts
            </button>
        </div>
    );
}

export default SystemAlerts;