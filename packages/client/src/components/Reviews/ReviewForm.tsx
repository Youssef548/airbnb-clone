import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../Buttons";

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (comment.length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ rating, comment });
      setRating(0);
      setComment("");
      toast.success("Review submitted!");
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Failed to submit review";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">Leave a Review</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            className="focus:outline-none"
          >
            <svg
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? "text-yellow-500 fill-current"
                  : "text-gray-300 fill-current"
              } transition-colors`}
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (at least 10 characters)"
        rows={4}
        className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
      />
      <div className="flex justify-end">
        <Button
          label={isLoading ? "Submitting..." : "Submit Review"}
          onClick={handleSubmit}
          disabled={isLoading}
          small
        />
      </div>
    </div>
  );
};

export default ReviewForm;
