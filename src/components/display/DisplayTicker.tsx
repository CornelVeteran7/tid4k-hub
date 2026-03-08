interface DisplayTickerProps {
  messages: string[];
  color: string;
}

export function DisplayTicker({ messages, color }: DisplayTickerProps) {
  if (messages.length === 0) return null;

  // Duplicate for seamless CSS loop
  const doubled = [...messages, ...messages];

  return (
    <div
      className="absolute bottom-0 left-0 right-0 py-[1vh] overflow-hidden z-10"
      style={{ backgroundColor: color }}
    >
      <div className="display-ticker-track whitespace-nowrap">
        {doubled.map((msg, i) => (
          <span key={i} className="mx-[3vw] text-[2vh] font-medium">
            {msg} ●
          </span>
        ))}
      </div>
    </div>
  );
}
