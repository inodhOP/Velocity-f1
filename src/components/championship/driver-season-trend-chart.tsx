'use client';

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export function DriverSeasonTrendChart({
  data,
  color = '#FF2D2D',
  compact = false,
}: {
  data: { label: string; cumulative: number }[];
  color?: string;
  compact?: boolean;
}) {
  const gradientId = `driver-trend-${color.replace(/[^a-zA-Z0-9]/g, '')}-${compact ? 'compact' : 'full'}`;

  return (
    <div className={compact ? 'h-36 w-full' : 'h-44 w-full'}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 0, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.65} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <YAxis hide domain={[0, 'dataMax + 4']} />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={color}
            strokeWidth={compact ? 2.5 : 3}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            style={{ filter: `drop-shadow(0 0 14px ${color})` }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
