import { PaginationData } from "../apis/Listing/listing.types";

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, hasNextPage, hasPreviousPage } = pagination;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 mb-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className={`
          px-4 py-2 rounded-md font-medium transition
          ${
            hasPreviousPage
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex gap-2">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="px-4 py-2">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`
                px-4 py-2 rounded-md font-medium transition
                ${
                  currentPage === page
                    ? "bg-rose-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`
          px-4 py-2 rounded-md font-medium transition
          ${
            hasNextPage
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
