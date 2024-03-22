import React from "react";

interface ImageProps {
  src: string | { src: string; width?: number; height?: number };
  alt?: string;
  width?: string;
  height?: string;
}

const Image: React.FC<ImageProps> = ({ src, alt, width, height }) => {
  try {
    const NextImage = require("next/image").default;
    return (
      <NextImage
        src={typeof src === "string" ? src : src.src}
        alt={alt}
        width={width}
        height={height}
      />
    );
  } catch (error) {
    console.log("Not using Next.js");
    return (
      <img
        src={typeof src === "string" ? src : src.src}
        alt={alt}
        width={width}
        height={height}
      />
    );
  }
};

export default Image;
