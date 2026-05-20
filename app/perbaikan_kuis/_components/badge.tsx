export default function Badge(name: string) {
    return(
        <div className="bg-blue-300 px-4 py-1 rounded-full text-sm ">
                        <p className="text-black text-xs items-center font-semibold ">{name}</p>
                    </div>
    )
}