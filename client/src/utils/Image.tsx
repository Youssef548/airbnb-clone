import React from "react";

interface ImageProps {
  src: string | { src: string; width?: number; height?: number };
  alt?: string;
  width?: string;
  height?: string;
  className?: string;
  onClick?: () => void;
}

const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  onClick,
}) => {
  return (
    <img
      src={typeof src === "string" ? src : src.src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onClick={onClick}
    />
  );
};

export default Image;
