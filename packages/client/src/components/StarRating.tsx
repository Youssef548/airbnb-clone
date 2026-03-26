interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
  showNumber?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = "sm",
  showNumber = true,
}) => {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className="flex items-center gap-1">
      <svg
        className={`${sizeClass} text-yellow-500 fill-current`}
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
      {showNumber && (
        <span className={`${textSize} font-semibold`}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
