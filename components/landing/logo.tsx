"use client";

import React from "react";
import Image from "next/image";

export const Logo: React.FC<{ className?: string; size?: "sm" | "md" | "lg" | "xl" }> = ({
  className = "",
  size = "md"
}) => {
  const sizes = {
    sm: { container: "w-8 h-8", px: 32 },
    md: { container: "w-10 h-10", px: 40 },
    lg: { container: "w-12 h-12", px: 48 },
    xl: { container: "w-16 h-16", px: 64 }
  };

  return (
    <div className={`${sizes[size].container} relative ${className}`}>
      <Image
        src="/icon.svg"
        alt="Looomy Logo"
        width={sizes[size].px}
        height={sizes[size].px}
        className="w-full h-full"
        priority
      />
    </div>
  );
};
