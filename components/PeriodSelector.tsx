
import React from 'react';

type View = 'monthly' | 'quarterly' | 'yearly';

interface PeriodSelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: View;
  onViewChange: (view: View) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ currentDate, onDateChange, view, onViewChange }) => {

  const handlePrev = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let newDate;
    if (view === 'monthly') {
      newDate = new Date(year, month - 1, 1);
    } else if (view === 'quarterly') {
      newDate = new Date(year, month - 3, 1);
    } else { // yearly
      newDate = new Date(year - 1, month, 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let newDate;
    if (view === 'monthly') {
      newDate = new Date(year, month + 1, 1);
    } else if (view === 'quarterly') {
      newDate = new Date(year, month + 3, 1);
    } else { // yearly
      newDate = new Date(year + 1, month, 1);
    }
    onDateChange(newDate);
  };

  const getPeriodString = () => {
    if (view === 'monthly') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    if (view === 'quarterly') {
      const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
      return `Q${quarter} ${currentDate.getFullYear()}`;
    }
    return currentDate.getFullYear().toString();
  };
  
  const getButtonClass = (buttonView: View) => {
    return `px-3 py-1 text-sm font-medium rounded-md transition-colors ${
      view === buttonView 
      ? 'bg-brand-primary text-white' 
      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex items-center bg-gray-800 p-1 rounded-lg">
        <button onClick={() => onViewChange('monthly')} className={getButtonClass('monthly')}>Monthly</button>
        <button onClick={() => onViewChange('quarterly')} className={getButtonClass('quarterly')}>Quarterly</button>
        <button onClick={() => onViewChange('yearly')} className={getButtonClass('yearly')}>Yearly</button>
      </div>
      <div className="flex items-center justify-center space-x-2 bg-gray-800 px-2 py-1 rounded-lg">
        <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-semibold text-white w-36 text-center">{getPeriodString()}</span>
        <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PeriodSelector;
