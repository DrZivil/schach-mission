
export async function loadTracks() {
  const trackFiles = [
    'rules_track.json',
    'strategy_track.json'
  ];

  const promises = trackFiles.map(async (filename) => {
    try {
      const res = await fetch(`js/missions/${filename}`);
      if (!res.ok) throw new Error(`Failed to load ${filename}`);
      return await res.json();
    } catch (err) {
      console.error(`Error loading ${filename}:`, err);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter(Boolean);
}
