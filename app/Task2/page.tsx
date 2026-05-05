import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "500", "700", "800"] });

export default function CourseCards() {
  return (
    <div className={`${nunito.className} bg-white min-h-screen flex items-center justify-center p-10`}>
      <div className="grid grid-cols-2 gap-[30px] max-w-[920px] w-full">

        {/* Card 1 - Adobe Photoshop */}
        <div className="bg-blue-100 rounded-2xl p-6 flex flex-col justify-between h-[260px] w-full">
          <div className="flex items-center gap-2 text-blue-900 text-sm font-bold">
            <img src="/palette.svg" alt="Design" className="w-4 h-4" />
            <p>Design</p>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900">Adobe Photoshop</h1>
            <p className="text-blue-900 text-sm mt-1 font-bold">in 3 days</p>
            <div className="absolute right-[-300px] bottom-0 flex items-center -space-x-2 relative">
          <img src="https://i.pravatar.cc/40?img=1" alt="User" className="w-7 h-7 rounded-full border-2 border-white" />
          <img src="https://i.pravatar.cc/40?img=2" alt="User" className="w-7 h-7 rounded-full border-2 border-white" />
          <img src="https://i.pravatar.cc/40?img=3" alt="User" className="w-7 h-7 rounded-full border-2 border-white" />
          <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-200 flex items-center justify-center text-[9px] font-bold text-blue-900">
            3+
          </div>
        </div>
          </div>
        </div>
        

        {/* Card 2 - DALL-E */}
        <div className="bg-green-100 rounded-2xl p-6 flex flex-col justify-between h-[260px] w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-900 text-sm font-bold">
              <img src="/terminal-svgrepo-com.svg" alt="AI" className="w-4 h-4" />
              <p>AI</p>
            </div>
            <span className="text-green-800 text-sm">✦</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-green-900 leading-tight">DALL·E 2, Midjourney,<br />Stable Diffusion</h1>
            <p className="text-green-900 text-sm mt-1 font-bold">in 5 days</p>
            <div className="absolute right-[-300px] bottom-0 flex items-center -space-x-2 relative">
          <img src="https://i.pravatar.cc/40?img=4" alt="User" className="w-7 h-7 rounded-full border-2 border-white" />
          <img src="https://i.pravatar.cc/40?img=5" alt="User" className="w-7 h-7 rounded-full border-2 border-white" />
          <img src="https://i.pravatar.cc/40?img=6" alt="User" className="w-7 h-7 rounded-full border-2 border-white" />
          <div className="w-7 h-7 rounded-full border-2 border-white bg-green-200 flex items-center justify-center text-[9px] font-bold text-green-900">
            5+
          </div>
        </div>
          </div>
        </div>

        {/* Row 2 - 3 cards */}
        <div className="col-span-2 grid grid-cols-3 gap-5">

          {/* Card 3 - Figma */}
          <div className="bg-purple-100 rounded-2xl p-6 flex flex-col justify-between h-[230px] w-full">
            <div className="flex items-center gap-2 text-purple-900 text-sm font-bold">
              <img src="/palette.svg" alt="Design" className="w-4 h-4" />
              <p>Design</p>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-purple-900">Figma</h1>
              <p className="text-purple-900 text-sm mt-1 font-bold">8 hours ago</p>
            </div>
          </div>

          {/* Card 4 - Python */}
          <div className="bg-orange-100 rounded-2xl p-6 flex flex-col justify-between h-[230px] w-full">
            <div className="flex items-center gap-2 text-orange-900 text-sm font-bold">
              <img src="/code.svg" alt="Coding" className="w-4 h-4" />
              <p>Codding</p>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-orange-900">Python</h1>
              <p className="text-orange-900 text-sm mt-1 font-bold">2 days ago</p>
            </div>
          </div>

          {/* Card 5 - Sketch */}
          <div className="bg-red-100 rounded-2xl p-6 flex flex-col justify-between h-[230px] w-full">
            <div className="flex items-center gap-2 text-pink-900 text-sm font-bold ">
              <img src="/palette.svg" alt="Design" className="w-4 h-4" />
              <p>Design</p>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-pink-900">Sketch</h1>
              <p className="text-pink-900 text-sm mt-1 font-bold">4 days ago</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
