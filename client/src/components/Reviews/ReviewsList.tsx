import { ReviewType } from "../../types/Review";
import Avatar from "../Avatar";
import StarRating from "../StarRating";
import { formatDistanceToNow } from "date-fns";

interface ReviewsListProps {
  reviews: ReviewType[];
  loading?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border-b border-neutral-200 pb-6 last:border-0">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar src={review.user?.image} />
            </div>

            {/* Review Content */}
            <div className="flex-1">
              {/* User Info & Rating */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-neutral-800">
                    {review.user?.name || review.user?.username || "Anonymous"}
                  </h4>
                  <p className="text-sm text-neutral-500">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <StarRating value={review.rating} readonly size={16} />
              </div>

              {/* Comment */}
              <p className="text-neutral-600 leading-relaxed">{review.comment}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
