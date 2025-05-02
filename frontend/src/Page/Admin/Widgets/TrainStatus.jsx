import React from 'react';

function TrainStatus({ stats }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-2xl font-semibold">{stats.reduce((acc, curr) => acc + curr.value, 0)}</p>
                    <p className="text-sm text-gray-500">Total trains in operation</p>
                </div>
                <div className="flex">
                    {stats.map((stat, index) => (
                        <div key={index} className="ml-3 flex items-center">
                            <div className={`w-3 h-3 rounded-full ${stat.color} mr-1`}></div>
                            <span className="text-sm">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-8 w-full flex rounded-full overflow-hidden">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`${stat.color}`}
                        style={{ width: `${stat.value}%` }}
                    ></div>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{stat.label}</span>
                            <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                        </div>
                        <p className="text-2xl font-medium mt-1">{stat.value}%</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TrainStatus;