export default function Card() {
    return(
        
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
    )

}