import Card from "./_component/card";

export default function Task3() {
    return (
        <div className="bg-gray-200 flex items-center justify-center min-h-screen py-2">
            <Card hari="Sen" tanggal="1 Januari 2023" harga="IDR 3.345.000" />
            <Card hari="Sel" tanggal="2 Januari 2023" harga="IDR 3.150.000" />
            <Card hari="Rab" tanggal="3 Januari 2023" harga="IDR 2.670.000" />
            <Card hari="Kam" tanggal="4 Januari 2023" harga="IDR 2.508.000" />
            <Card hari="Jum" tanggal="5 Januari 2023" harga="IDR 3.660.000" />
            <Card hari="Sab" tanggal="6 Januari 2023" harga="IDR 3.580.000" />
            <Card hari="Min" tanggal="7 Januari 2023" harga="IDR 4.130.000" />
            <Card hari="Sen" tanggal="8 Januari 2023" harga="IDR 4.580.000" />
        </div>
    );
}