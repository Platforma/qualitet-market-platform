export default function BreakdownsPage() {
  const breakdowns = [
    { id: 1, title: "Brak mocy – BMW 530d", description: "Możliwa awaria turbiny lub EGR." },
    { id: 2, title: "Szarpanie – Audi A4 2.0 TDI", description: "Problemy z wtryskiem lub dwumasą." },
    { id: 3, title: "Piski przy hamowaniu – VW Golf", description: "Zużyte klocki lub tarcze hamulcowe." }
  ];

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Awarie pojazdów</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {breakdowns.map(b => (
          <div
            key={b.id}
            className="p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
          >
            <h2 className="font-semibold">{b.title}</h2>
            <p className="text-gray-600">{b.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
