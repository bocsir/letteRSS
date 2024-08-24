import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="w-full h-screen pb-32 flex items-center justify-center">
      <div className="flex flex-col gap-2 items-center">
        <p className="text-xl"><span className="text-amber-300 text-2xl p-1 bg-[#5c3d13] shadow-[0px_0px_10px_2px_rgb(147,91,9)]">404</span> Page not found :(</p>
        <Link
          className="text-xl bg-amber-300 w-min p-2 mt-3 mb-2 rounded-lg leading-3 cursor-pointer text-stone-800 font-bold transition-all hover:shadow-[0px_0px_10px_2px_rgb(147,91,9)] hover:text-amber-800"
          to="/"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
