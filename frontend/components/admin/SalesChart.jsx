"use client";
import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

const SalesChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
           try {
               const rawData = await api.get('/analytics/daily-sales');
               // Handle both array and object formats
               if (Array.isArray(rawData)) {
                   setData(rawData);
               } else if (rawData && typeof rawData === 'object') {
                   const chartData = Object.entries(rawData).map(([date, amount]) => ({
                       date,
                       amount: typeof amount === 'number' ? amount : 0
                   }));
                   setData(chartData);
               }
           } catch (err) {
               console.error("Failed to fetch analytics:", err);
           }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // Simple bar chart using CSS (no recharts dependency needed for basic display)
    const maxAmount = Math.max(...data.map(d => d.amount), 1);

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 h-64 flex flex-col">
            <h3 className="text-accent-gold font-serif text-lg mb-4">Revenue Trend</h3>
            {data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-white/20 italic">
                    No sales data available
                </div>
            ) : (
                <div className="flex-1 flex items-end gap-2 px-2">
                    {data.map((entry, i) => (
                        <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                            <div
                                className="w-full rounded-t transition-all duration-500 hover:opacity-80"
                                style={{
                                    height: `${(entry.amount / maxAmount) * 100}%`,
                                    minHeight: 4,
                                    backgroundColor: i === data.length - 1 ? '#C2A878' : '#6B705C',
                                }}
                                title={`₹${entry.amount}`}
                            />
                            <span className="text-[9px] text-white/30 truncate w-full text-center">
                                {entry.date?.slice(-5) || ''}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SalesChart;
