import React from 'react';
import { Activity, Server, Wifi, Database, AlertTriangle } from 'lucide-react';

function SystemPerformance({ performance }) {
    if (!performance) {
        return (
            <div className="text-center py-4 text-gray-500">
                <div className="animate-pulse">Loading system performance data...</div>
            </div>
        );
    }

    const { systemHealth, apiResponse, networkStatus, databaseStatus, alerts } = performance;

    const getHealthColor = (value) => {
        if (value >= 90) return 'text-green-600 bg-green-100';
        if (value >= 75) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getStatusIcon = (status) => {
        const colors = {
            excellent: 'bg-green-500',
            good: 'bg-yellow-500',
            poor: 'bg-red-500'
        };
        return <div className={`w-2 h-2 ${colors[status] || 'bg-gray-500'} rounded-full`}></div>;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm">System Performance</h4>
                <div className="flex items-center">
                    {getStatusIcon(systemHealth.status)}
                    <span className="ml-1 text-xs text-gray-500 capitalize">{systemHealth.status}</span>
                </div>
            </div>

            <div className="flex-1 space-y-3">
                {/* Overall Health Score - Compact */}
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center mb-1">
                        <Activity size={16} className="text-blue-600 mr-2" />
                        <span className="text-xs font-medium text-blue-800">System Health</span>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-lg font-bold ${getHealthColor(systemHealth.score)}`}>
                        {systemHealth.score}%
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Based on train performance & utilization</p>
                </div>

                {/* Performance Metrics - Compact Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 border border-gray-200 rounded">
                        <div className="flex items-center mb-1">
                            <Server size={12} className="text-gray-600 mr-1" />
                            <span className="text-xs font-medium text-gray-700">API Response</span>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{apiResponse.time}ms</p>
                        <p className={`text-xs ${apiResponse.status === 'good' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {apiResponse.status}
                        </p>
                    </div>

                    <div className="p-2 border border-gray-200 rounded">
                        <div className="flex items-center mb-1">
                            <Wifi size={12} className="text-gray-600 mr-1" />
                            <span className="text-xs font-medium text-gray-700">Network</span>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{networkStatus.latency}ms</p>
                        <p className={`text-xs ${networkStatus.status === 'stable' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {networkStatus.status}
                        </p>
                    </div>
                </div>

                {/* Database Performance - More Compact */}
                <div className="p-2 border border-gray-200 rounded">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                            <Database size={12} className="text-gray-600 mr-1" />
                            <span className="text-xs font-medium text-gray-700">Database</span>
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded ${databaseStatus.status === 'optimal' ? 'bg-green-100 text-green-600' :
                                databaseStatus.status === 'normal' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-red-100 text-red-600'
                            }`}>
                            {databaseStatus.status}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="text-center">
                            <p className="text-gray-500">Query</p>
                            <p className="font-medium">{databaseStatus.queryTime}ms</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500">Conn</p>
                            <p className="font-medium">{databaseStatus.connections}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500">Load</p>
                            <p className="font-medium text-green-600">{databaseStatus.load}%</p>
                        </div>
                    </div>
                </div>

                {/* System Alerts - Only show if there are alerts and space allows */}
                {alerts.length > 0 && (
                    <div className="border-t border-gray-200 pt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Alerts</p>
                        <div className="space-y-1">
                            {alerts.slice(0, 1).map((alert, index) => (
                                <div key={index} className="flex items-center p-1 bg-yellow-50 rounded border border-yellow-200">
                                    <AlertTriangle size={12} className="text-yellow-500 mr-1 flex-shrink-0" />
                                    <span className="text-xs text-yellow-700 truncate">{alert.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SystemPerformance;