import { Icon } from "@iconify/react";
import { useState } from "react";

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  showValue?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  readonly = false,
  size = 20,
  showValue = false,
}) => {
  const [hover, setHover] = useState<number>(0);

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHover(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHover(0);
    }
  };

  const getStarColor = (index: number) => {
    const currentRating = hover || value;
    if (index <= currentRating) {
      return "text-yellow-500";
    }
    return "text-gray-300";
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}
              transition-transform
              focus:outline-none
            `}
          >
            <Icon
              icon={
                index <= (hover || value)
                  ? "ant-design:star-filled"
                  : "ant-design:star-outlined"
              }
              className={`
                ${getStarColor(index)}
                transition-colors
              `}
              fontSize={size}
            />
          </button>
        ))}
      </div>
      {showValue && value > 0 && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
