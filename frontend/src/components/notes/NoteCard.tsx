import { PenLine, Ellipsis } from "lucide-react";
const NoteCard = ({
  title,
  content,
  date,
}: {
  title: string;
  content: string;
  date: string;
}) => {
  return (
    <div className="rounded-xl p-6 bg-gray-50 flex flex-col gap-2 cursor-pointer hover:bg-gray-100">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="rounded-xl bg-gray-200 p-2 flex text-gray-500 ">
          <Ellipsis className="w-4 h-4 cursor-pointer" />
        </div>
      </div>
      <p className="text-gray-600 text-sm line-clamp-3">
        {content.length > 100 ? `${content.substring(0, 100)}...` : content}
      </p>
      <p className="text-gray-500 text-xs rounded-xl bg-gray-200 w-fit px-4 py-2 flex items-center gap-2 my-2">
        <PenLine className="w-4 h-4" />
        {date}
      </p>
    </div>
  );
};

export default NoteCard;
