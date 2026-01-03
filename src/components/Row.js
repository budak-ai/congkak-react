import React from 'react';
import Hole from './Hole';
import config from '../config/config';

const Row = ({ seeds, isUpper, rowType, onClick, refs, selectedHole, burnedHoles = [] }) => {

  const rowClass = rowType === 'upper' ? 'row-upper' : 'row-lower';

  return (
    <div className={rowClass}>
      {seeds.map((seedCount, index) => {
        // Adjust the index based on the row type
        const adjustedIndex = rowType === 'upper' ? index : config.MAX_INDEX_LOWER - index;
        const isSelected = adjustedIndex === selectedHole;
        // burnedHoles array is 0-6 for each player's row
        const burnedIndex = isUpper ? adjustedIndex : adjustedIndex - 7;
        const isBurned = burnedHoles[burnedIndex] || false;

        return (
          <Hole
            key={adjustedIndex}
            ref={el => refs[adjustedIndex] = el}
            index={adjustedIndex}
            isUpper={isUpper}
            seedCount={seedCount}
            onClick={onClick}
            isSelected={isSelected}
            isBurned={isBurned}
          />
        );
      })}
    </div>
  );
};

export default Row;