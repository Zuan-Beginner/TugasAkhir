export default function Card ({ hari = "hari", tanggal = "tanggal", harga = "harga" }) {
    return (
        <div className="bg-white border border-gray-200 p-3 items-center justify-center ">
            <p className="text-black text-sm">{hari},{tanggal}</p>
            <p className="text-xl font-bold text-black flex items-center justify-center">{harga}</p>
        </div>
    );
}