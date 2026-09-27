"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Skeleton } from "../ui/Skeleton";

const ParcelMapInner = dynamic(
  () => import("./ParcelMapInner").then((mod) => mod.ParcelMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-fog rounded-card border border-mist p-6">
        <Skeleton variant="card" className="w-full h-full min-h-[350px]" />
      </div>
    ),
  }
);

export const ParcelMap: React.FC<React.ComponentProps<typeof ParcelMapInner>> = (props) => {
  return <ParcelMapInner {...props} />;
};
