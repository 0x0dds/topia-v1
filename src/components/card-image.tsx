"use client";

import Image from "next/image";
import { useState } from "react";
import { getCardImageUrl } from "@/lib/image";

interface CardImageProps {
  setCode: string;
  collectorNumber: string;
  imageSmallUrl?: string | null;
  imageLargeUrl?: string | null;
  name: string;
  size?: "small" | "large";
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function CardImage({
  setCode,
  collectorNumber,
  imageSmallUrl,
  imageLargeUrl,
  name,
  size = "small",
  width = 245,
  height = 342,
  className = "",
  priority = false,
}: CardImageProps) {
  const [error, setError] = useState(false);
  const fallback = size === "large" ? imageLargeUrl : imageSmallUrl;
  const src = getCardImageUrl(setCode, collectorNumber, fallback);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-bg-card text-text-dim text-xs ${className}`}
        style={{ width, height }}
      >
        <span className="text-center px-2">{name}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}
