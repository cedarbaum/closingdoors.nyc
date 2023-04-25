export function PathSolidCircleIcon({ color }: { color: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: color,
        borderRadius: 99999,
        border: "2px solid white",
      }}
    />
  );
}

export function PathMulticolorCircleIcon({
  leftColor,
  rightColor,
}: {
  leftColor: string;
  rightColor: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(to right, ${leftColor} 50%, ${rightColor} 50%)`,
        borderRadius: 99999,
        border: "2px solid white",
      }}
    />
  );
}
