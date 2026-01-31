import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
  workerId: string;
  workerName: string;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  workerId, 
  workerName,
  size = 200 
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size * 2;
    canvas.height = size * 2;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = `${workerId}-qr-code.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${workerId}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              padding: 40px;
              border: 2px solid #eee;
              border-radius: 16px;
            }
            h1 { font-size: 24px; margin-bottom: 8px; }
            p { color: #666; margin-bottom: 24px; }
            .qr-code { margin: 24px 0; }
            .worker-id { 
              font-family: monospace;
              font-size: 18px;
              background: #f5f5f5;
              padding: 8px 16px;
              border-radius: 8px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${workerName}</h1>
            <p>Digital Health Record</p>
            <div class="qr-code">${svgData}</div>
            <div class="worker-id">${workerId}</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={qrRef} className="qr-container mb-6">
        <QRCodeSVG
          value={workerId}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#0d9488"
        />
      </div>
      
      <p className="text-sm font-mono text-muted-foreground mb-4 bg-muted px-4 py-2 rounded-lg">
        {workerId}
      </p>
      
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
