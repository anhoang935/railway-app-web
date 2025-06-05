import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

function RevenueAnalytics({ revenue, timeFilter = 'today' }) {
    if (!revenue) {
        return (
            <div className="text-center py-4 text-gray-500">
                <div className="animate-pulse">Loading revenue data...</div>
            </div>
        );
    }

    const { daily, weekly, monthly, growth } = revenue;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getCurrentPeriodRevenue = () => {
        const periods = { today: daily, week: weekly, month: monthly };
        return periods[timeFilter] || daily || 0;
    };

    const getTimeLabel = () => {
        const labels = { today: 'Today', week: 'This Week', month: 'This Month' };
        return labels[timeFilter] || 'Today';
    };

    const currentRevenue = getCurrentPeriodRevenue();
    const hasGrowth = growth !== 0;
    const isPositiveGrowth = growth >= 0;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm">Revenue Analytics</h4>
                <button className="text-xs text-blue-600 hover:text-blue-800">View Report</button>
            </div>

            <div className="flex-1 space-y-3">
                {/* Main Revenue Display - Compact */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs text-green-600 font-medium">{getTimeLabel()}</p>
                            <p className="text-xl font-bold text-green-800">{formatCurrency(currentRevenue)}</p>
                            {hasGrowth && (
                                <div className="flex items-center mt-1">
                                    {isPositiveGrowth ? (
                                        <TrendingUp size={12} className="text-green-500 mr-1" />
                                    ) : (
                                        <TrendingDown size={12} className="text-red-500 mr-1" />
                                    )}
                                    <span className={`text-xs font-medium ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
                                        {Math.abs(growth)}% vs last month
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-2 bg-green-100 rounded-full">
                            <DollarSign size={16} className="text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Revenue Breakdown - Compact */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: 'Daily', value: daily },
                        { label: 'Weekly', value: weekly },
                        { label: 'Monthly', value: monthly }
                    ].map(({ label, value }) => (
                        <div key={label} className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500 uppercase font-medium">{label}</p>
                            <p className="text-sm font-semibold text-gray-800">{formatCurrency(value)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RevenueAnalytics;