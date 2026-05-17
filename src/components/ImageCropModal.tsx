import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface Area { x: number; y: number; width: number; height: number; }

interface Props {
  imageSrc: string;
  aspect: number; // 1 for square (avatar), 16/9 or wider for banner
  onConfirm: (croppedBase64: string) => void;
  onCancel: () => void;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    img,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg', 0.85);
}

export function ImageCropModal({ imageSrc, aspect, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [confirming, setConfirming] = useState(false);

  const onCropComplete = useCallback((_: Area, cap: Area) => {
    setCroppedAreaPixels(cap);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setConfirming(true);
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(cropped);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex flex-col bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#121826] border-b border-white/10 shrink-0">
        <button onClick={onCancel} className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <span className="text-white font-black uppercase text-xs tracking-widest">Ajustar Foto</span>
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="px-4 py-2 bg-orange-500 rounded-xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/30"
        >
          <Check size={16} />
          {confirming ? 'Salvando...' : 'Confirmar'}
        </button>
      </div>

      {/* Crop area */}
      <div className="relative flex-grow">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: '#070b13' },
            cropAreaStyle: { border: '2px solid #f97316', boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)' },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-4 px-6 py-5 bg-[#121826] border-t border-white/10 shrink-0">
        <ZoomOut size={18} className="text-gray-500 shrink-0" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="flex-grow h-1.5 rounded-full appearance-none bg-white/10 accent-orange-500 cursor-pointer"
        />
        <ZoomIn size={18} className="text-gray-500 shrink-0" />
      </div>
    </div>
  );
}
