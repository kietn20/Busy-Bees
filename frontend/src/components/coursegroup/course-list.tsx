import Image from "next/image";
import { MessageCircle, Calendar, WalletCards } from "lucide-react";

interface Course {
  id: string;
  image: string;
  name: string;
  link: string;
}

interface CourseListProps {
  courses: Course[];
}

const CourseList = ({ courses }: CourseListProps) => {
  return (
    <div className="flex flex-wrap gap-6">
      {courses.map((course) => (
        <div
          key={course.id}
          className="relative rounded-lg border shadow-sm overflow-hidden"
        >
          <div className="relative w-72 h-40 overflow-hidden rounded-t-lg">
            <a href={course.link}>
              <Image
                src={course.image}
                alt={course.name}
                fill
                className="object-cover"
              />
            </a>
          </div>
          <div className="p-4">
            <a href={course.link} className="text-sm font-semibold">
              {course.name}
            </a>
            <div className="flex items-center gap-4 px-1 mt-1">
              <MessageCircle className="w-4 h-4 mr-1 cursor-pointer" />
              <Calendar className="w-4 h-4 mr-1 cursor-pointer" />
              <WalletCards className="w-4 h-4 mr-1 cursor-pointer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;
