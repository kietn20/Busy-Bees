"use client";
import Image from "next/image";

import { useParams } from "next/navigation";

const QuickLinks = () => {
  const params = useParams();
  const groupId = params?.groupId as string;
  const links = [
    { name: "Notes", href: `/groups/${groupId}/notes` },
    { name: "Flashcards", href: `/groups/${groupId}/flashcards` },
    { name: "Events", href: `/groups/${groupId}/events` },
  ];
  return (
    <div className="p-4">
      <div className="flex gap-6">
        {links.map((link) => (
          <div
            key={link.name}
            className="relative rounded-lg border shadow-sm overflow-hidden w-1/3 "
          >
            <div className="relative h-40 overflow-hidden rounded-t-lg">
              <a href={`${link.href}`}>
                <Image
                  src="/beige.jpg"
                  alt={link.name}
                  fill
                  className="object-cover"
                />
              </a>
            </div>
            <div className="p-4">
              <a href={`${link.href}`} className="text-md font-semibold">
                {link.name}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default QuickLinks;
