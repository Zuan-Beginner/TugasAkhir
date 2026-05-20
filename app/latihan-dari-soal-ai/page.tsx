import { PenTool } from "lucide-react";

export default function latihandarisoalai() {
    return(
        <div className="bg-black min-h-screen flex flex-col items-center justify-center gap-5">
            <div className="gap-5 flex flex-row items-center justify-center ">
                <div className="bg-blue-200 rounded-2xl px-2 py-5 h-70 w-77 ">
                    <div className="bg-blue-200 rounded-2xl flex-col items-center justify-center gap-3 h-30 w-30 flex">
                        <img src="anchor-svgrepo-com.svg" className="w-20 h-20 rounded-2xl bg-blue-100 p-2 item-center"/>
                        <p className="text-blue-600 text-xs font-semibold ">Design</p>
                    </div>
                </div>
                <div className="bg-green-200 rounded-2xl justify-between h-70 w-77 "></div>
            </div>    
            <div className="gap-5 flex flex-row items-center ">
                <div className="bg-purple-200 rounded-2xl justify-between h-70 w-77 "></div>
                <div className="bg-orange-200 rounded-2xl justify-between h-70 w-77 "></div>
            </div>
        </div>
    );
}