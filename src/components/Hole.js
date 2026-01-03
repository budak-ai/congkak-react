import React, { forwardRef } from 'react';

const Hole = forwardRef(({ index, isUpper, seedCount, onClick, isSelected, isBurned }, ref) => {
  const selectedClass = isSelected ? 'selected' : '';
  const burnedClass = isBurned ? 'burned' : '';

  return (
    <div
      ref={ref}
      className={`circle ${isUpper ? 'upper-row' : ''} ${selectedClass} ${burnedClass}`}
      onClick={() => !isBurned && onClick(index)}
    >
      <div className="circle-index">{index}</div>
      {isBurned ? (
        <div className="burned-overlay">
          <span className="burned-x">X</span>
        </div>
      ) : (
        <div className={`seed-count ${isUpper ? 'flipped' : ''}`}>
          {seedCount}
        </div>
      )}
    </div>
  );
});

export default Hole;