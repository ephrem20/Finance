
import React from 'react';

interface SummaryCardProps {
  title: string;
  amount: number;
  color: string;
  limit?: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, color, limit }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

  const formattedAmount = formatCurrency(amount);

  const hasLimit = typeof limit === 'number' && limit > 0;
  const progress = hasLimit ? (amount / limit) * 100 : 0;
  
  let progressBarColor = 'bg-brand-secondary';
  if (progress > 100) progressBarColor = 'bg-red-500';
  else if (progress >= 80) progressBarColor = 'bg-yellow-500';

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-md font-medium text-gray-400">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{formattedAmount}</p>
      {hasLimit && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Limit: {formatCurrency(limit)}</span>
            <span className={progress > 100 ? 'text-red-400 font-bold' : progress >= 80 ? 'text-yellow-400 font-bold' : ''}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
