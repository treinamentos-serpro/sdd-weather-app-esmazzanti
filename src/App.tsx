export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-night-900 px-4 py-10 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass backdrop-blur-md">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-accent-400">
          Weather App
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          SDD Weather App
        </h1>
        <p className="mt-4 text-lg text-slate-200">Previsão do tempo</p>
        <p className="mt-2 text-sm text-slate-300">
          Busque uma cidade e veja as condições climáticas em poucos segundos.
        </p>
      </div>
    </main>
  );
}
