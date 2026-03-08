import { QRCodeSVG } from 'qrcode.react';

interface DisplayHeaderProps {
  orgName: string;
  orgLogo?: string;
  primaryColor: string;
  qrUrl: string;
}

export function DisplayHeader({ orgName, orgLogo, primaryColor, qrUrl }: DisplayHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-[2vw] py-[1.5vh]">
      <div className="flex items-center gap-[1vw]">
        {orgLogo && (
          <img
            src={orgLogo}
            alt={orgName}
            className="h-[5vh] w-[5vh] rounded-lg object-contain bg-white/10 p-1"
          />
        )}
        <span className="text-[2.5vh] font-bold opacity-80">{orgName}</span>
      </div>
      <div className="flex items-center gap-[1.5vw]">
        <DisplayClock />
        <div className="bg-white rounded-lg p-[0.5vh]">
          <QRCodeSVG value={qrUrl} size={48} />
        </div>
      </div>
    </div>
  );
}

function DisplayClock() {
  // Use CSS animation to avoid JS re-renders for Puppeteer
  return (
    <span className="text-[2vh] opacity-50 font-mono tabular-nums">
      {new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}
