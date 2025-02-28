"use client";

import Image from "next/image";
import { STAMPED_CONFIG } from "@/lib/reviews/config";

export function ReviewsBadge() {
  if (!STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
    return null;
  }

  const badgeUrl =
    `https://stamped.io/inc/image/badges.png?` +
    `apikey=${STAMPED_CONFIG.publicKey}&` +
    `sId=${STAMPED_CONFIG.storeHash}&` +
    `type=badge2&` +
    `label1=&` +
    `label2=`;

  return (
    <Image
      src={badgeUrl}
      alt="Stamped.io Verified Reviews"
      width={120}
      height={48}
      className="h-12 object-contain"
      priority={false}
      loading="lazy"
    />
  );
}
