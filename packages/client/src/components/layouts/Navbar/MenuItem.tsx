interface menuItemsProps {
  onClick: () => void;
  label: string;
}

const MenuItem: React.FC<menuItemsProps> = ({ onClick, label }) => {
  return (
    <div
      onClick={onClick}
      data-testid={`menu-item-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="
  px-4
  py-2
  hover:bg-neutral-100
  transition
  font-semibold
  "
    >
      {label}
    </div>
  );
};

export default MenuItem;
