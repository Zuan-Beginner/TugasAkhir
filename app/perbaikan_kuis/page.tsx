import Badge from "./_components/badge";
import Button from "./_components/button";
import button from "./_components/button";
import Card from "./_components/card";

export default function PerbaikanKuis() {
  return (
    <div className={`bg-gray-300 min-h-screen flex items-center justify-center flex-col gap-3   p-10`}>
       <div className="grid grid-cols-4 items-center justify-between gap-3  w-full"> 
        <div className=" bg-white rounded-2xl flex flex-col gap-2 px-3 py-3 h-70 w-77">
            <div className="bg-blue-200 flex flex-col gap-5 py-3 rounded-2xl px-3 h-60 ">
                <h1 className="text-2xl font-bold text-black">Web Design</h1>
                <p className="text-black text-sm">Craft engaging, user-friendly Good websites .</p>
                <div className="bg-blue-200 rounded-2xl  gap-4  ">
                    <div className="bg-blue-200 rounded-2xl items-center flex flex-wrap  gap-2  w-full ">
                    <div className="bg-blue-300 px-4 py-1 rounded-full text-sm">
                        <p className="text-black text-xs items-center  font-semibold ">Landing Page</p>
                    </div>
                    <div className="bg-blue-300 px-4 py-1 rounded-full text-sm">
                        <p className="text-black text-xs items-center font-semibold ">One Page</p>
                    </div>                        
                    <div className="bg-blue-300 px-4 py-1 rounded-full text-sm ">
                        <p className="text-black text-xs items-center font-semibold ">Web Site</p>
                    </div>
                    <div className="bg-blue-300 px-4 py-1 rounded-full text-sm ">
                        <p className="text-black text-xs items-center font-semibold ">Web Site</p>
                    </div>
                </div>
                </div>
            </div>
            <div className="bg-gray-200 rounded-2xl  py-2 px-3 flex items-center gap-2 justify-between">
                <h1 className="text-lg font-semibold text-black">Eksplore</h1>
                <img src="/right-circle-o.svg" className="w-6 h-6 " />
            </div>
        </div>


        <div className=" bg-white rounded-2xl flex flex-col gap-2 px-3 py-3 h-70 w-77 ">
            <div className="bg-orange-200 flex flex-col gap-5 py-3 rounded-2xl px-3 h-60">
                <h1 className="text-2xl font-bold text-black">Graphics Design</h1>
                <p className="text-black text-sm">Create impactful visual and branding materials Profesional.</p>
                <div className="bg-orange-200 rounded-2xl items-center flex flex-wrap  gap-2  w-full ">
                    <div className="bg-orange-300 px-4 py-1 rounded-full text-sm">
                        <p className="text-black text-xs items-center  font-semibold ">Packaging</p>
                    </div>
                    <div className="bg-orange-300 px-4 py-1 rounded-full text-sm">
                        <p className="text-black text-xs items-center font-semibold ">Brand Identity</p>
                    </div>                        
                    <div className="bg-orange-300 px-4 py-1 rounded-full text-sm ">
                        <p className="text-black text-xs items-center font-semibold ">ilustrations</p>
                    </div>
                    <div className="bg-orange-300 px-4 py-1 rounded-full text-sm">
                        <p className="text-black text-xs items-center font-semibold ">Logo</p>
                    </div>
                    <div className="bg-orange-300 px-4 py-1 rounded-full text-sm">
                        <p className="text-black text-xs items-center font-semibold ">Signage</p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-200 rounded-2xl  px-3 py-2 flex items-center gap-2 justify-between">
                <h1 className="text-lg font-semibold text-black">Eksplore</h1>
                <img src="/right-circle-o.svg" className="w-6 h-6 " />
            </div>
        </div>


        <div className=" bg-white rounded-2xl flex flex-col gap-2 px-3 py-3 h-70 w-77 ">
            <div className="bg-purple-200 flex flex-col gap-5 p-3 rounded-2xl  h-60 ">
                <h1 className="text-2xl font-bold text-black">Developers</h1>
                <p className="text-black text-sm">Build functional and scalable web applications.</p>
                <div className="bg-purple-200 rounded-2xl items-center flex flex-wrap  gap-2  w-full ">
                    <div className="bg-purple-300 px-4 py-1 rounded-full text-sm">
                        <p className="text-black text-xs items-center  font-semibold ">Web Application</p>
                    </div>
                    <div className="bg-purple-300 px-4 py-1 rounded-full text-sm">
                        <p className="text-black text-xs items-center font-semibold ">Mobile App</p>
                    </div>                        
                    <div className="bg-purple-300 px-4 py-1 rounded-full text-sm ">
                        <p className="text-black text-xs items-center font-semibold ">Data Base</p>
                    </div>
                    <div className="bg-purple-300 px-4 py-1 rounded-full text-sm ">
                        <p className="text-black text-xs items-center font-semibold ">Add-on</p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-200 rounded-2xl  px-3 py-2 flex items-center gap-2 justify-between">
                <h1 className="text-lg font-semibold text-black">Eksplore</h1>
                <img src="/right-circle-o.svg" className="w-6 h-6 " />
            </div>
        </div>


        <div className=" bg-white rounded-2xl flex flex-col gap-2 px-3 py-3 h-70 w-77 ">
            <div className="bg-green-200 flex flex-col gap-5 p-3 rounded-2xl  h-60">
                <h1 className="text-2xl font-bold text-black">Copywriting</h1>
                <p className="text-black text-sm">Deliver persuasive and creative content special.</p>
                <div className="bg-green-200 rounded-2xl items-center flex flex-wrap  gap-2  w-full ">
                    <div className="bg-green-300 px-4 py-1 rounded-full text-sm">
                        <p className="text-black text-xs items-center  font-semibold ">Blog Post</p>
                    </div>
                    <div className="bg-green-300 px-4 py-1 rounded-full text-sm">
                        <p className="text-black text-xs items-center font-semibold ">Video Script</p>
                    </div>                        
                    <div className="bg-green-300 px-4 py-1 rounded-full text-sm ">
                        <p className="text-black text-xs items-center font-semibold ">Sales Pages</p>
                    </div>
                    <div className="bg-green-300 px-4 py-1 rounded-full text-sm ">
                        <p className="text-black text-xs items-center font-semibold ">Slogans</p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-200 rounded-2xl  px-3 py-2 flex items-center gap-2 justify-between">
                <h1 className="text-lg font-semibold text-black">Eksplore</h1>
                <img src="/right-circle-o.svg" className="w-6 h-6 " />
            </div>
        </div>
       </div> 
    </div>    
  )
}