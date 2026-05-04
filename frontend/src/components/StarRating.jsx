import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value, onChange, readOnly = false, size = 24 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${display >= star ? 'filled' : ''}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          disabled={readOnly}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            size={size}
            fill={display >= star ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}
