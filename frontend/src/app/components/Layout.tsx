import { Outlet, Link, useLocation } from "react-router";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: "New Upload", path: "/" },
    { name: "Schemas", path: "/schemas" },
    { name: "Lookups", path: "/lookups" },
    { name: "History", path: "/sessions" },
    { name: "Review", path: "/review" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="font-semibold text-lg">Data Ingestion Platform</div>
          <nav className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
