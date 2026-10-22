import { API } from "@/lib/api";
type Guide = {
  version: string;
  instructions: string;
  measurements: { size: string; chest: number; waist: number; hips: number }[];
};
export async function SizeGuide() {
  let guide: Guide | null = null;
  try {
    const response = await fetch(`${API}/size-guide`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) guide = await response.json();
  } catch {}
  return guide ? (
    <>
      <h2>Mesures du corps · centimètres</h2>
      <p>{guide.instructions}</p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Taille Pletosie</th>
              <th>Poitrine (cm)</th>
              <th>Taille (cm)</th>
              <th>Hanches (cm)</th>
            </tr>
          </thead>
          <tbody>
            {guide.measurements.map((m) => (
              <tr key={m.size}>
                <td>{m.size}</td>
                <td>{m.chest}</td>
                <td>{m.waist}</td>
                <td>{m.hips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <small>
        Version {guide.version}. Ce tableau décrit le corps ; l’aisance du
        vêtement dépend de sa coupe.
      </small>
    </>
  ) : (
    <div className="info">
      Le guide définitif doit être renseigné et validé par la créatrice avant
      l’ouverture des ventes. Les tailles disponibles sont XS, S, M, L, XL et XXL. Les mesures de chaque taille seront précisées par la créatrice.
    </div>
  );
}
