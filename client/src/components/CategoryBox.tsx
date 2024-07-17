import React, { useCallback } from "react";
import { Icon, IconifyIcon } from "@iconify/react";
import { useSearchParams } from "react-router-dom";
import queryString from "qs";
import { getListing } from "../apis/Listing/listing";
import ListingStore from "../store/listingsStore";

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
  const { setListings } = ListingStore();
  let [params, setSearchParams] = useSearchParams();

  let qs = queryString as any;

  const handleClick = useCallback(() => {
    let currentQuery: Record<string, string | string[]> = {};

    if (params) {
      currentQuery = qs.parse(params.toString()) as any;
    }

    const updatedQuery: Record<string, string | string[]> = {
      ...currentQuery,
      category: label,
    };

    if (params?.get("category") == label) {
      delete updatedQuery.category;
    }

    setSearchParams(updatedQuery);

    getListing({ ...updatedQuery }).then((res) => {
      if (res.status === 200) {
        setListings(res.data);
      }
    });
  }, [params, label]);

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
