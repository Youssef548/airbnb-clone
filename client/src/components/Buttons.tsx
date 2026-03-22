import { Icon } from "@iconify/react";

interface ButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: string;
  iconSize?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled,
  outline,
  small,
  icon,
  iconSize,
  // Using HeroIcons Icon type
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      data-testid={`btn-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className={`
        relative
        disabled:opacity-70
        disabled:cursor-not-allowed
        rounded-lg
        hover:opacity-80
        transition
        w-full
        ${outline ? "bg-white" : "bg-rose-500"}
        ${outline ? "border-black" : "border-rose-500"}
        ${outline ? "text-black" : "text-white"}
        ${small ? "text-sm" : "text-md"}
        ${small ? "py-1" : "py-3"}
        ${small ? "font-light" : "font-semibold"}
        ${small ? "border-[1px]" : "border-2"}
      `}
    >
      {icon && (
        <Icon
          icon={icon}
          className="
            absolute
            left-4
            top-3
          "
          style={{ fontSize: iconSize ? iconSize : "" }}
        />
      )}
      {label}
    </button>
  );
};

export default Button;
