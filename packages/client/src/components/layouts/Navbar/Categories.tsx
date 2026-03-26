import Container from "../../Container";
import CategoryBox from "../../CategoryBox";

import { useSearchParams, useLocation } from "react-router-dom";

import homeIcon from "@iconify/icons-mdi/home";
import starIcon from "@iconify/icons-mdi/star";

import cupStrawIcon from '@iconify/icons-bi/cup-straw';
import airplaneIcon from '@iconify/icons-bi/airplane';
import musicNoteIcon from '@iconify/icons-bi/music-note';
import bookIcon from '@iconify/icons-bi/book';
import heartIcon from '@iconify/icons-bi/heart';

export const categories = [
  {
    id: "1",
    label: "Homes",
    icon: homeIcon,
  },
  {
    id: "2",
    label: "Experiences",
    icon: starIcon,
  },
  {
    id: "3",
    label: "Drinks",
    icon: cupStrawIcon,
  },
  {
    id: "4",
    label: "Travel",
    icon: airplaneIcon,
  },
  {
    id: "5",
    label: "Music",
    icon: musicNoteIcon,
  },
  {
    id: "7",
    label: "Sports",
    icon: heartIcon,
  },
  {
    id: "8",
    label: "Fashion",
    icon: starIcon,
  },
  {
    id: "9",
    label: "Books",
    icon: bookIcon,
  },
  {
    id: "10",
    label: "Wellness",
    icon: heartIcon,
  },
];

const Categories = () => {
  const [params] = useSearchParams();
  const categoryParam = params?.get("category");
  const { pathname } = useLocation();

  const isMainPage = pathname === "/";

  if (!isMainPage) {
    return null;
  }

  return (
    <Container>
      <div
        className="
        pt-4
        flex
        flex-row
        items-center
        justify-between
        overflow-x-hidden"
      >
        {categories.map((category) => (
          <CategoryBox
            key={category.label}
            label={category.label}
            selected={categoryParam === category.label}
            icon={category.icon}
          />
        ))}
      </div>
    </Container>
  );
};

export default Categories;
