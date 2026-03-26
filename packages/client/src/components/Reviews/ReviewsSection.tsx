import { useCallback, useEffect, useState } from "react";
import { ReviewType, UserType } from "@airbnb/shared";
import {
  getReviews,
  createReview,
  deleteReview,
} from "../../apis/Reviews/review";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import StarRating from "../StarRating";

interface ReviewsSectionProps {
  listingId: string;
  currentUser?: UserType | null;
  averageRating?: number;
  reviewCount?: number;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  listingId,
  currentUser,
  averageRating = 0,
  reviewCount = 0,
}) => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [displayRating, setDisplayRating] = useState(averageRating);
  const [displayCount, setDisplayCount] = useState(reviewCount);

  const fetchReviews = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        const res = await getReviews(listingId, pageNum);
        const { reviews: fetched, pagination } = res.data;
        setReviews((prev) => (append ? [...prev, ...fetched] : fetched));
        setHasMore(pagination.hasNextPage);
      } catch {
        // silently fail — reviews are not critical
      }
    },
    [listingId]
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleSubmitReview = async (data: {
    rating: number;
    comment: string;
  }) => {
    await createReview(listingId, data);
    setPage(1);
    await fetchReviews(1);
    setDisplayCount((prev) => prev + 1);
    setDisplayRating((prev) => {
      const total = prev * displayCount + data.rating;
      return Math.round((total / (displayCount + 1)) * 10) / 10;
    });
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setPage(1);
      await fetchReviews(1);
      setDisplayCount((prev) => Math.max(0, prev - 1));
    } catch {
      // handled by axios interceptor
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  const hasReviewed = reviews.some((r) => r.user._id === currentUser?._id);

  return (
    <div className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-semibold">Reviews</h2>
        {displayCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={displayRating} size="md" />
            <span className="text-neutral-500">
              ({displayCount} review{displayCount !== 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 && (
        <p className="text-neutral-500 mb-6">No reviews yet.</p>
      )}

      {reviews.map((review) => (
        <ReviewCard
          key={review._id}
          review={review}
          isOwn={review.user._id === currentUser?._id}
          onDelete={handleDeleteReview}
        />
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-4 text-rose-500 font-semibold hover:underline"
        >
          Show more reviews
        </button>
      )}

      {currentUser && !hasReviewed && (
        <div className="mt-6">
          <ReviewForm onSubmit={handleSubmitReview} />
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
