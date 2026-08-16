export default function PartsPage() {
  const parts = [
    { id: 1, name: "Alternator BMW E46", price: 250, seller: "Jan Kowalski" },
    { id: 2, name: "Turbina Audi A6 3.0 TDI", price: 1200, seller: "AutoMax" },
    { id: 3, name: "Amortyzator VW Passat B6", price: 180, seller: "MotoParts" }
  ];

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Części samochodowe</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {parts.map(part => (
          <div
            key={part.id}
            className="p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
          >
            <h2 className="font-semibold">{part.name}</h2>
            <p className="text-gray-600">{part.price} zł</p>
            <p className="text-sm text-gray-500">Sprzedawca: {part.seller}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
