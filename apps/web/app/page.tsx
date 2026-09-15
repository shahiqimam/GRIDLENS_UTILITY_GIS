const operationalLayers = [
  "Substations",
  "Feeders",
  "Segments",
  "Transformers",
  "Service areas",
  "Crews",
  "Incidents"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-zinc-800 pr-6">
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">GridLens</p>
          <h1 className="mt-4 text-3xl font-semibold">Utility Operations Map</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Synthetic network data only. Phase 1 will connect this shell to authenticated map,
            telemetry, incident, and dispatch services.
          </p>
          <div className="mt-8 space-y-2">
            {operationalLayers.map((layer) => (
              <div
                className="flex items-center justify-between border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
                key={layer}
              >
                <span>{layer}</span>
                <span className="h-2 w-2 rounded-full bg-zinc-600" />
              </div>
            ))}
          </div>
        </aside>
        <section className="grid min-h-[560px] place-items-center border border-zinc-800 bg-zinc-900">
          <div className="max-w-md text-center">
            <p className="text-sm uppercase tracking-wide text-cyan-300">Map workspace</p>
            <h2 className="mt-3 text-2xl font-semibold">MapLibre layer work starts in Phase 3</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              The backend will first define authenticated spatial endpoints backed by PostGIS, then
              this view will render viewport-aware GeoJSON.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
