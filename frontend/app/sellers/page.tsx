export default function SellersPage() {
  const sellers = [
    { id: 1, name: "Jan Kowalski", city: "Warszawa", products: 12 },
    { id: 2, name: "AutoMax", city: "Poznań", products: 34 },
    { id: 3, name: "MotoParts", city: "Kraków", products: 18 }
  ];

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Sprzedawcy</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sellers.map(seller => (
          <div
            key={seller.id}
            className="p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
          >
            <h2 className="font-semibold">{seller.name}</h2>
            <p className="text-gray-600">Miasto: {seller.city}</p>
            <p className="text-sm text-gray-500">
              Produkty w sprzedaży: {seller.products}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
