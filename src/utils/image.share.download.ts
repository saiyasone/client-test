import html2canvas from "html2canvas";
import { errorMessage } from "./alert.util";

export const handleShareQR = async (event: React.MouseEvent<HTMLButtonElement>, qrCodeRef: React.RefObject<HTMLElement>, text: {title: string, description: string}) => {
    event.preventDefault();
    const fileName = text.title || "share-file";
    const element = qrCodeRef.current;
    let result: boolean = false;

    if (!element) return false;

    try {
      const scaleFactor = 10; //image pixel scale 10 times
      const canvas = await html2canvas(element, {
        scale: window.devicePixelRatio * scaleFactor,
        useCORS: true,
        allowTaint: true,
      });
  
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg')
      );
      if (!blob) {
        throw new Error("Failed to convert canvas to blob");
      }

      const file = new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });
  
      if (navigator.canShare && navigator.canShare({ files: [file], text: text.description })) {
       
        await navigator.share({
          title: fileName,
          text: text.description,
          files: [file],
        }).then(()=>{
          console.log('Shared QR code and text successfully!');
          // successMessage('Shared QR code and text successfully!', 3000);
          result = true;
        }).catch((err: any)=>{
          throw new Error("Error => "+ err?.message || err);
        })
      } else {
        // errorMessage('Browser to share is not support.', 3000);
        console.log('Browser to share is not support sharing image.');
      }

    } catch (error) {
      console.error('Error sharing the QR code or text:', error);
      errorMessage('Failed to share the QR code or text.', 3000);
    }
    
    return result;
  };
  

export const handleDownloadQRCode = (event: React.MouseEvent<HTMLButtonElement>, qrCodeRef: React.RefObject<HTMLElement | any>, text: {title: string, description: string}) => {
  event.preventDefault();
  const fileName = text.title || "download-qr";
  const svgElement = qrCodeRef.current.querySelector("svg");
  if (!svgElement) return;

  // Define padding and border radius
  const padding = 20;
  const borderRadius = 10;
  const borderWidth = 2;

  // Get the SVG dimensions
  const svgWidth = parseInt(svgElement.getAttribute("width") || 256);
  const svgHeight = parseInt(svgElement.getAttribute("height") || 256);

  const scaleFactor = 20; //increase pixel 20 times
  const canvasWidth = (svgWidth + padding * 2) * scaleFactor;
  const canvasHeight = (svgHeight + padding * 2) * scaleFactor;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  if(!ctx){
    return;
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
  }

  ctx.fillStyle = "white";
  drawRoundedRect(ctx, borderWidth * scaleFactor, borderWidth * scaleFactor, canvas.width - borderWidth * scaleFactor * 2, canvas.height - borderWidth * scaleFactor * 2, borderRadius * scaleFactor);
  ctx.fill();

  // Draw border
  ctx.strokeStyle = "gray";
  ctx.lineWidth = borderWidth * scaleFactor;
  ctx.stroke();

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const img = new Image();
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = function () {
      ctx.drawImage(img, padding * scaleFactor, padding * scaleFactor, svgWidth * scaleFactor, svgHeight * scaleFactor);

      const imgURL = canvas.toDataURL("image/jpeg");

      // Trigger download
      const link = document.createElement("a");
      link.href = imgURL;
      link.download = `${fileName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
  };

  img.onerror = function () {
      console.error("Failed to load image.");
  };

  img.src = url;
};


