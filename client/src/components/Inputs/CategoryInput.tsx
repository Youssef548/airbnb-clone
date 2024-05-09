import { Icon, IconifyIcon } from '@iconify/react';

interface CategoryInputProps {
  icon: IconifyIcon;
  label: string;
  selected?: boolean;
  onClick: (value: string) => void;
}

const CategoryInput: React.FC<CategoryInputProps> = ({
  icon,
  label,
  selected,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(label)}
      className={`
        rounded-xl
        border-2
        p-4
        flex
        flex-col
        gap-3
        hover:border-black
        transition
        cursor-pointer
        ${selected ? "border-black" : "border-neutral-200"}
        `}
    >
      <Icon icon={icon} style={{ fontSize: '30px' }} />
      <div className='font-semibold'>
        {label}
      </div>
    </div>
  );
};

export default CategoryInput;
