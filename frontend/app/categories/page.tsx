export default function CategoriesPage() {
  const categories = [
    { id: 1, name: "Silniki" },
    { id: 2, name: "Zawieszenie" },
    { id: 3, name: "Układ hamulcowy" },
    { id: 4, name: "Elektryka" },
    { id: 5, name: "Karoseria" }
  ];

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Kategorie części</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
          >
            {cat.name}
          </div>
        ))}
      </div>
    </main>
  );
}
