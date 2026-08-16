export default function AdminPage() {
  const actions = [
    { id: 1, name: "Zarządzanie częściami", path: "/parts" },
    { id: 2, name: "Zarządzanie sprzedawcami", path: "/sellers" },
    { id: 3, name: "Zarządzanie awariami", path: "/breakdowns" },
    { id: 4, name: "Statystyki systemu", path: "/admin/stats" },
    { id: 5, name: "Ustawienia platformy", path: "/admin/settings" }
  ];

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Panel Administratora</h1>
      <p className="text-gray-600 mb-6">
        Wybierz moduł, który chcesz zarządzać.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map(action => (
          <a
            key={action.id}
            href={action.path}
            className="p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer block"
          >
            <h2 className="font-semibold">{action.name}</h2>
          </a>
        ))}
      </div>
    </main>
  );
}
