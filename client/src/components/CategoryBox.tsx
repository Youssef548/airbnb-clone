import React, { useCallback } from "react";
import { Icon, IconifyIcon } from "@iconify/react";
import { useSearchParams } from "react-router-dom";
import queryString from "qs";

interface CategoryBoxProps {
  label: string;
  description?: string;
  selected?: boolean;
  icon: IconifyIcon;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  label,
  description,
  icon,
  selected = false, // Default value for selected
}) => {
  const [params, setSearchParams] = useSearchParams();

  const handleClick = useCallback(() => {
    const currentQuery: Record<string, string | string[]> = params
      ? (queryString.parse(params.toString()) as Record<string, string | string[]>)
      : {};

    const updatedQuery: Record<string, string | string[]> = {
      ...currentQuery,
      category: label,
      page: "1", // Reset to page 1 when filtering
    };

    if (params?.get("category") === label) {
      delete updatedQuery.category;
    }

    setSearchParams(updatedQuery);
  }, [params, label, setSearchParams]);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 p-3 border-b-2 hover:text-neutral-800 transition cursor-pointer ${
        selected
          ? "border-b-neutral-800 text-neutral-800"
          : "border-transparent text-neutral-500"
      }`}
      onClick={handleClick}
    >
      <Icon icon={icon} style={{ fontSize: "26px" }} />
      <div>{label}</div>
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
};

export default CategoryBox;
