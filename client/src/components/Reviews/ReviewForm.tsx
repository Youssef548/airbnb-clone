import { useState } from "react";
import StarRating from "../StarRating";
import { CreateReviewData } from "../../types/Review";

interface ReviewFormProps {
  listingId: string;
  onSubmit: (data: CreateReviewData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  listingId,
  onSubmit,
  loading = false,
  error = null,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validation
    if (rating === 0) {
      setValidationError("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      setValidationError("Comment must be at least 10 characters");
      return;
    }

    if (comment.trim().length > 500) {
      setValidationError("Comment cannot exceed 500 characters");
      return;
    }

    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        listingId,
      });

      // Reset form on success
      setRating(0);
      setComment("");
    } catch (err) {
      // Error handling is done by parent component
      console.error("Failed to submit review:", err);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValidationError("");
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    setValidationError("");
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Input */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Your Rating
          </label>
          <StarRating
            value={rating}
            onChange={handleRatingChange}
            size={32}
            showValue
          />
        </div>

        {/* Comment Input */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-neutral-700 mb-2"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={handleCommentChange}
            placeholder="Share your experience with this listing (minimum 10 characters)..."
            disabled={loading}
            className="
              w-full
              p-3
              border
              border-neutral-300
              rounded-lg
              focus:outline-none
              focus:ring-2
              focus:ring-rose-500
              focus:border-transparent
              disabled:opacity-50
              disabled:cursor-not-allowed
              resize-none
            "
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-500">
              {comment.length}/500 characters
            </span>
            {comment.length >= 10 && (
              <span className="text-xs text-green-600">
                Minimum length reached ✓
              </span>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {(validationError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {validationError || error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || rating === 0 || comment.trim().length < 10}
          className="
            w-full
            bg-rose-500
            text-white
            py-3
            px-4
            rounded-lg
            font-semibold
            hover:bg-rose-600
            disabled:opacity-50
            disabled:cursor-not-allowed
            transition
            focus:outline-none
            focus:ring-2
            focus:ring-rose-500
            focus:ring-offset-2
          "
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
