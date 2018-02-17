import React from 'react';

const LEGEND_COLORS = [
  '#f7f7f7',
  '#cccccc',
  '#969696',
  '#636363',
  '#252525',
];

/**
 * Denotes the legend for colors
 */
export default function ConfidenceLegend() {
  const confidenceColors = LEGEND_COLORS;
  const buckets = confidenceColors.length;
  const bucketSize = 100 / buckets;

  return (
    <div className="ag-sidebar--legend">
      <p className="text-center">Confidence legend:</p>
      {confidenceColors.map((color, i) =>
        <span
          key={color}
          className="ag-sidebar--legend-elem"
        >
          <span
            className="ag-sidebar--legend-box"
            style={{
              backgroundColor: color,
            }}
          />
          {`${i * bucketSize}-${(i + 1) * bucketSize}%`}
        </span>
        )}
    </div>
  );
}
