
function App() {
  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <div className="navbar border-b border-base-300 px-6">
        <div className="flex-1">
          <a className="text-xl font-bold">
            Vilas<span className="text-primary">Share</span>
          </a>
        </div>

        <div className="badge badge-success badge-outline">
          Development
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="card border border-base-300 bg-base-200 shadow-xl">
          <div className="card-body">
            <p className="text-sm font-medium text-primary">
              SHARE MANAGEMENT SYSTEM
            </p>

            <h1 className="text-3xl font-bold">
              Welcome to VilasShare
            </h1>

            <p className="max-w-xl text-base-content/70">
              Manage shareholders, payments, installments and
              project finances from one place.
            </p>

            <div className="mt-4">
              <span className="badge badge-outline">
                Frontend initialized
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
