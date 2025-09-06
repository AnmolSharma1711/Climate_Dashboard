import React from 'react';
import './DateRangeSelector.css';

const DateRangeSelector = ({ selectedRange, onRangeChange, loading }) => {
  const ranges = [
    { value: 7, label: 'Past 7 days', description: 'Last week' },
    { value: 14, label: 'Past 2 weeks', description: 'Last 2 weeks' },
    { value: 30, label: 'Past month', description: 'Last 30 days' },
    { value: 90, label: 'Past 3 months', description: 'Last 90 days' }
  ];

  return (
    <div className="date-range-selector">
      <div className="row align-items-center mb-3">
        <div className="col-md-6">
          <h6 className="mb-2">
            <i className="fas fa-calendar-alt me-2"></i>
            Select Time Period
          </h6>
        </div>
        <div className="col-md-6">
          <div className="btn-group w-100" role="group">
            {ranges.map((range) => (
              <button
                key={range.value}
                type="button"
                className={`btn ${selectedRange === range.value ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => onRangeChange(range.value)}
                disabled={loading}
                title={range.description}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {selectedRange && (
        <div className="selected-range-info">
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Showing data for the last {selectedRange} days
            {loading && (
              <span className="ms-2">
                <i className="fas fa-spinner fa-spin"></i> Loading...
              </span>
            )}
          </small>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
