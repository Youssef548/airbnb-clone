import { ReviewType } from "@airbnb/shared";
import { formatDistanceToNow } from "date-fns";
import StarRating from "../StarRating";
import Avatar from "../Avatar";

interface ReviewCardProps {
  review: ReviewType;
  onDelete?: (reviewId: string) => void;
  isOwn?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onDelete, isOwn }) => {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-neutral-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={review.user.image} />
          <div>
            <div className="font-semibold text-sm">{review.user.username}</div>
            <div className="text-neutral-500 text-xs">
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          {isOwn && onDelete && (
            <button
              onClick={() => onDelete(review._id)}
              className="text-rose-500 text-sm hover:underline"
              aria-label="Delete review"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <p className="text-neutral-700 text-sm leading-relaxed">
        {review.comment}
      </p>
    </div>
  );
};

export default ReviewCard;
