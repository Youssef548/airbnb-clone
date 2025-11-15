import homeIcon from "@iconify/icons-mdi/home";
import starIcon from "@iconify/icons-mdi/star";
import cupStrawIcon from '@iconify/icons-bi/cup-straw';
import airplaneIcon from '@iconify/icons-bi/airplane';
import musicNoteIcon from '@iconify/icons-bi/music-note';
import bookIcon from '@iconify/icons-bi/book';
import heartIcon from '@iconify/icons-bi/heart';
import type { IconifyIcon } from "@iconify/types";

export interface Category {
  id: string;
  label: string;
  icon: IconifyIcon;
}

export const categories: Category[] = [
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
    label: "cupStrawIcon",
    icon: cupStrawIcon,
  },
  {
    id: "4",
    label: "airPlane",
    icon: airplaneIcon,
  },
  {
    id: "5",
    label: "Music",
    icon: musicNoteIcon,
  },
  {
    id: "7",
    label: "Football",
    icon: heartIcon,
  },
  {
    id: "8",
    label: "Fashion",
    icon: cupStrawIcon,
  },
  {
    id: "9",
    label: "bookIcon",
    icon: bookIcon,
  },
  {
    id: "10",
    label: "Heart",
    icon: heartIcon,
  },
];
