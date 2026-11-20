export interface SnapshotProductInfo {
  id: string;
  name: string;
  price: string;
  culture: string;
}

export interface CapturedSnapshotResult {
  rawUrl: string;
  rawBlob: Blob;
  brandedUrl: string;
  brandedBlob: Blob;
  width: number;
  height: number;
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType = 'image/png', quality = 0.95): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Gagal mengonversi kanvas snapshot ke gambar PNG.'));
        }
      },
      mimeType,
      quality
    );
  });
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

async function extractModelViewerBlob(modelViewerEl: any): Promise<Blob> {
  if (!modelViewerEl) {
    throw new Error('Elemen model-viewer belum siap.');
  }

  // Primary official API on <model-viewer>
  if (typeof modelViewerEl.toBlob === 'function') {
    const blob = await modelViewerEl.toBlob({
      mimeType: 'image/png',
      qualityArgument: 0.96,
      idealAspect: false,
    });
    if (blob && blob.size > 0) {
      return blob;
    }
  }

  // Fallback to toDataURL
  if (typeof modelViewerEl.toDataURL === 'function') {
    const dataUrl = modelViewerEl.toDataURL('image/png', 0.96);
    const res = await fetch(dataUrl);
    return await res.blob();
  }

  // Last-resort shadow canvas extraction
  const shadowCanvas = modelViewerEl.shadowRoot?.querySelector('canvas') as HTMLCanvasElement | null;
  if (shadowCanvas) {
    return await canvasToBlob(shadowCanvas, 'image/png', 0.96);
  }

  throw new Error('Peramban tidak dapat mengambil tangkapan layar WebGL saat ini.');
}

function drawCoverVideo(
  ctx: CanvasRenderingContext2D,
  videoEl: HTMLVideoElement,
  targetW: number,
  targetH: number
) {
  const vw = videoEl.videoWidth || targetW;
  const vh = videoEl.videoHeight || targetH;
  const videoRatio = vw / vh;
  const targetRatio = targetW / targetH;

  let sx = 0;
  let sy = 0;
  let sw = vw;
  let sh = vh;

  if (videoRatio > targetRatio) {
    sw = vh * targetRatio;
    sx = (vw - sw) / 2;
  } else {
    sh = vw / targetRatio;
    sy = (vh - sh) / 2;
  }

  ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, targetW, targetH);
}

function drawStudioBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0D2B28');
  grad.addColorStop(0.55, '#091E1C');
  grad.addColorStop(1, '#061311');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Heritage Jade & Champagne Gold studio stage aura
  const jadeGlow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    width * 0.04,
    width * 0.5,
    height * 0.42,
    width * 0.52
  );
  jadeGlow.addColorStop(0, 'rgba(36, 123, 115, 0.24)');
  jadeGlow.addColorStop(1, 'rgba(13, 43, 40, 0)');
  ctx.fillStyle = jadeGlow;
  ctx.fillRect(0, 0, width, height);

  const goldGlow = ctx.createRadialGradient(
    width * 0.28,
    height * 0.78,
    width * 0.02,
    width * 0.28,
    height * 0.78,
    width * 0.4
  );
  goldGlow.addColorStop(0, 'rgba(197, 155, 66, 0.14)');
  goldGlow.addColorStop(1, 'rgba(6, 19, 17, 0)');
  ctx.fillStyle = goldGlow;
  ctx.fillRect(0, 0, width, height);
}

export async function captureARSnapshot(
  modelViewerEl: any,
  product: SnapshotProductInfo,
  options?: {
    videoEl?: HTMLVideoElement | null;
    isLightStage?: boolean;
  }
): Promise<CapturedSnapshotResult> {
  const modelBlob = await extractModelViewerBlob(modelViewerEl);
  const modelBlobUrl = URL.createObjectURL(modelBlob);

  try {
    const modelImg = await loadImageFromUrl(modelBlobUrl);

    const rect = modelViewerEl.getBoundingClientRect?.();
    const baseWidth = Math.max(modelImg.naturalWidth || rect?.width || 1080, 1080);
    const aspect =
      modelImg.naturalWidth && modelImg.naturalHeight
        ? modelImg.naturalHeight / modelImg.naturalWidth
        : rect?.height && rect?.width
        ? rect.height / rect.width
        : 1;

    const width = Math.round(baseWidth);
    const height = Math.round(Math.max(width * aspect, 720));

    // 1. Compose Raw Scene Canvas (Camera Feed or Studio Backdrop + 3D Model)
    const rawCanvas = document.createElement('canvas');
    rawCanvas.width = width;
    rawCanvas.height = height;
    const rawCtx = rawCanvas.getContext('2d');
    if (!rawCtx) {
      throw new Error('Konteks 2D kanvas tidak tersedia.');
    }

    const videoEl = options?.videoEl;
    if (videoEl && videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
      drawCoverVideo(rawCtx, videoEl, width, height);
    } else if (options?.isLightStage) {
      const lightGrad = rawCtx.createLinearGradient(0, 0, width, height);
      lightGrad.addColorStop(0, '#EFECE4');
      lightGrad.addColorStop(0.55, '#FAF8F3');
      lightGrad.addColorStop(1, '#E5EFED');
      rawCtx.fillStyle = lightGrad;
      rawCtx.fillRect(0, 0, width, height);
    } else {
      drawStudioBackdrop(rawCtx, width, height);
    }

    // Draw 3D model snapshot cleanly centered
    const imgRatio = modelImg.naturalWidth / Math.max(modelImg.naturalHeight, 1);
    const canvasRatio = width / height;
    let drawW = width;
    let drawH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawW = width;
      drawH = width / imgRatio;
      offsetY = (height - drawH) / 2;
    } else {
      drawH = height;
      drawW = height * imgRatio;
      offsetX = (width - drawW) / 2;
    }

    rawCtx.drawImage(modelImg, offsetX, offsetY, drawW, drawH);

    // 2. Compose Branded Balla AR Gallery Card Canvas
    const brandedCanvas = document.createElement('canvas');
    brandedCanvas.width = width;
    brandedCanvas.height = height;
    const bCtx = brandedCanvas.getContext('2d');
    if (!bCtx) {
      throw new Error('Konteks 2D kanvas tidak tersedia.');
    }

    bCtx.drawImage(rawCanvas, 0, 0);

    // Subtle champagne gold inner framing line
    const pad = Math.round(width * 0.03);
    bCtx.strokeStyle = 'rgba(215, 180, 99, 0.45)';
    bCtx.lineWidth = Math.max(2, Math.round(width * 0.0022));
    drawRoundedRectPath(bCtx, pad, pad, width - pad * 2, height - pad * 2, Math.round(width * 0.024));
    bCtx.stroke();

    // Top-left Balla AR Snapshot tag
    const topBadgeH = Math.round(width * 0.044);
    const topBadgeW = Math.round(width * 0.22);
    const badgeX = pad + Math.round(width * 0.02);
    const badgeY = pad + Math.round(width * 0.02);

    bCtx.fillStyle = 'rgba(10, 41, 38, 0.78)';
    drawRoundedRectPath(bCtx, badgeX, badgeY, topBadgeW, topBadgeH, topBadgeH / 2);
    bCtx.fill();
    bCtx.strokeStyle = 'rgba(215, 180, 99, 0.55)';
    bCtx.lineWidth = Math.max(1.5, width * 0.0015);
    bCtx.stroke();

    bCtx.fillStyle = '#D7B463';
    bCtx.font = `700 ${Math.round(width * 0.016)}px "Plus Jakarta Sans", sans-serif`;
    bCtx.textBaseline = 'middle';
    bCtx.fillText('BALLA AR · SNAPSHOT', badgeX + Math.round(width * 0.02), badgeY + topBadgeH / 2);

    // Bottom editorial info strip
    const bannerH = Math.round(Math.max(height * 0.13, width * 0.105));
    const bannerY = height - pad - bannerH - Math.round(width * 0.018);
    const bannerX = pad + Math.round(width * 0.018);
    const bannerW = width - (pad + Math.round(width * 0.018)) * 2;

    bCtx.fillStyle = 'rgba(10, 41, 38, 0.86)';
    drawRoundedRectPath(bCtx, bannerX, bannerY, bannerW, bannerH, Math.round(width * 0.02));
    bCtx.fill();
    bCtx.strokeStyle = 'rgba(215, 180, 99, 0.42)';
    bCtx.lineWidth = Math.max(1.5, width * 0.0015);
    bCtx.stroke();

    const textPadX = bannerX + Math.round(width * 0.028);
    bCtx.fillStyle = '#D7B463';
    bCtx.font = `700 ${Math.round(width * 0.015)}px "Plus Jakarta Sans", sans-serif`;
    bCtx.fillText(
      `WARISAN ADAT ${product.culture.toUpperCase()}`,
      textPadX,
      bannerY + bannerH * 0.3
    );

    bCtx.fillStyle = '#FAF8F3';
    bCtx.font = `700 ${Math.round(width * 0.027)}px "Playfair Display", Georgia, serif`;
    bCtx.fillText(product.name, textPadX, bannerY + bannerH * 0.65);

    // Price on right side of bottom strip
    bCtx.textAlign = 'right';
    bCtx.fillStyle = '#E6CD8A';
    bCtx.font = `800 ${Math.round(width * 0.022)}px "Plus Jakarta Sans", sans-serif`;
    bCtx.fillText(product.price, bannerX + bannerW - Math.round(width * 0.028), bannerY + bannerH * 0.5);
    bCtx.textAlign = 'left';

    const [rawBlob, brandedBlob] = await Promise.all([
      canvasToBlob(rawCanvas, 'image/png', 0.95),
      canvasToBlob(brandedCanvas, 'image/png', 0.95),
    ]);

    return {
      rawBlob,
      rawUrl: URL.createObjectURL(rawBlob),
      brandedBlob,
      brandedUrl: URL.createObjectURL(brandedBlob),
      width,
      height,
    };
  } finally {
    URL.revokeObjectURL(modelBlobUrl);
  }
}
