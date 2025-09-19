
import React from 'react';

interface SummaryCardProps {
  title: string;
  amount: number;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, color }) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-md font-medium text-gray-400">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{formattedAmount}</p>
    </div>
  );
};

export default SummaryCard;
