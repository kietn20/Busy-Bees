"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isGroupPage = pathname?.startsWith('/groups/');

  // Don't show header on group pages since they have their own sidebar navigation
  if (isGroupPage) {
    return null;
  }

  return <Header />;
}
