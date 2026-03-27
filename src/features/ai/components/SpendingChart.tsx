import React from 'react';
import { motion } from 'motion/react';
import { LineChart } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { formatCurrency, formatCurrencyParts } from '../../../utils/formatCurrency';

type TrendPoint = {
  month: string;
  type: 'HISTORICAL' | 'FORECAST';
  amount: number;
};

type SpendingChartProps = {
  chartData: TrendPoint[];
  currencyCode: string;
  currencySymbol: string;
  trendInsight: string;
  theme: string;
};

export function SpendingChart({
  chartData,
  currencyCode,
  currencySymbol,
  trendInsight,
  theme
}: SpendingChartProps) {
  const resolvedSymbol = currencySymbol || formatCurrencyParts('0', currencyCode).symbol;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/50 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 rounded-xl">
          <LineChart className="w-5 h-5 text-sky-500" />
        </div>
        <div>
          <h3 className="font-bold">6-Month Trend</h3>
          <p className="text-xs text-slate-500">Historical vs Forecast</p>
        </div>
      </div>
      
      <div className="h-48 w-full mt-2 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} tickFormatter={(val) => `${resolvedSymbol}${val/1000}k`} />
            <RechartsTooltip 
              cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
              itemStyle={{ fontWeight: 'bold' }}
              formatter={(value: number) => [formatCurrency(value.toFixed(2), currencyCode), 'Amount']}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
            />
            <Bar dataKey="amount" radius={[6, 6, 6, 6]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.type === 'FORECAST' ? '#a855f7' : '#6366f1'} fillOpacity={entry.type === 'FORECAST' ? 0.6 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          {trendInsight}
        </p>
      </div>
    </motion.div>
  );
}
