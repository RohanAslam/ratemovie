import { useState } from "react";
import { PropTypes } from "prop-types";

StarRating.propTypes = {
  maxRating: PropTypes.number,
  defaultRating: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  messages: PropTypes.array,
  className: PropTypes.string,
  onSetRating: PropTypes.func,
};

export default function StarRating({
  maxRating = 10,
  color = "#fcc419",
  size = 22,
  className = "",
  messages = [],
  defaultRating = 0,
  onSetRating,
}) {
  const [rating, setRating] = useState(defaultRating);
  const [tempRating, setTempRating] = useState(0);

  const handleRating = function (i) {
    setRating(i + 1);
    onSetRating(i + 1);
  };

  return (
    <div className={className}>
      <div
        className=""
        style={{ display: "flex", alignItems: "center", gap: "2px" }}
      >
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            size={size}
            color={color}
            fillValue={
              i < (tempRating !== 0 ? tempRating : rating) ? color : "none"
            }
            onRate={() => handleRating(i)}
            onHoverIn={() => setTempRating(i + 1)}
            onHoverOut={() => setTempRating(0)}
          />
        ))}

        <p
          style={{
            lineHeight: 1,
            margin: "0px",
            color: `${color}`,
            fontSize: `${size}px`,
          }}
        >
          {messages.length === maxRating
            ? messages[tempRating ? tempRating - 1 : rating - 1]
            : tempRating || rating || ""}
        </p>
      </div>
    </div>
  );
}

function Star({ onRate, fillValue, onHoverIn, onHoverOut, size, color }) {
  return (
    <div style={{ display: "flex" }}>
      <span
        role="button"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "block",
          cursor: "pointer",
        }}
        onClick={onRate}
        onMouseEnter={onHoverIn}
        onMouseLeave={onHoverOut}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={fillValue}
          viewBox="0 0 24 24"
          stroke={color}
        >
          <path
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          ></path>
        </svg>
      </span>
    </div>
  );
}
