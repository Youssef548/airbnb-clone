import { Icon } from "@iconify/react";
import type { IconifyIcon } from "@iconify/types";

interface ListingCategoryProps {
  icon: IconifyIcon;
  label: string;
}
const ListingCategory = ({ icon, label }: ListingCategoryProps) => {
  return <div className="flex flex-col gap-6">
    <div className="flex flex-row items-center gap-4">
        <Icon icon={icon} className="text-2xl" fontSize={40} />
        <div className="flex flex-col">
            <div className="text-lg font-semibold">
                {label}
            </div>
        </div>
    </div>
  </div>;
};

export default ListingCategory;
