import CourseList from "@/components/coursegroup/course-list";
import AddGroup from "@/components/coursegroup/add-group";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to Busy Bee</h1>
        <p className="mt-4 text-lg text-gray-600">
          Your collaborative study platform.
        </p>
      </div>
      <CourseList
        courses={[
          {
            id: "1",
            name: "CECS 329: Computer Theory",
            link: "https://example.com/course1",
            image: "/beige.jpg",
          },
          {
            id: "2",
            name: "Course 2",
            link: "https://example.com/course2",
            image: "/beige.jpg",
          },
        ]}
      />
      <AddGroup />
    </main>
  );
}
