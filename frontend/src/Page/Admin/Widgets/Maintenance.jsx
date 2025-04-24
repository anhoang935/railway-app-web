import React from 'react';

function Maintenance({ maintenance }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Upcoming Maintenance</h4>
                <button className="text-sm text-blue-600 hover:text-blue-800">Schedule</button>
            </div>

            <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {maintenance.map(item => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 text-sm">{item.line}</td>
                                <td className="px-4 py-3 text-sm">{item.section}</td>
                                <td className="px-4 py-3 text-sm">{item.date}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Maintenance;