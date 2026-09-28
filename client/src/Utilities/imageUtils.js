// Shrinks a camera photo before upload. Phone photos are often 3–8 MB; the
// meter digits stay perfectly legible at ~1600px, and the smaller file keeps
// the upload fast on mobile data and under the server's size limit.
export const resizeImage = (file, maxSide = 1600, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Could not process image")),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
