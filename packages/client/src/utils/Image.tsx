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

export const optimizedImageUrl = (url: string, width: number = 400): string => {
  if (!url || !url.includes("cloudinary")) return url;
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
};
