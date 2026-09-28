// Reads the kWh counter from a meter photo entirely in the browser with
// Tesseract.js (free, no API key). Tesseract is a general text OCR, so the
// photo is cleaned up first and the result is sanity-checked against the
// previous reading to pick the right number out of everything it sees.

const INTEGER_DIGITS = 5; // "10K 1K 100 10 1" drums
const TOTAL_DIGITS = INTEGER_DIGITS + 1; // + the red 1/10 drum
// A month's usage above this is treated as a misread (e.g. a serial number).
const MAX_PLAUSIBLE_JUMP = 5000;

// Tesseract page segmentation modes
const PSM_SINGLE_LINE = "7";
const PSM_SPARSE_TEXT = "11";

// One worker for the whole session. The first use downloads the OCR engine and
// English data (~4 MB) from the CDN; the browser caches them after that.
let workerPromise;
const getWorker = () => {
  workerPromise ??= import("tesseract.js")
    .then(({ createWorker }) => createWorker("eng", 1))
    .catch((error) => {
      workerPromise = undefined; // allow a retry after a network failure
      throw error;
    });
  return workerPromise;
};

// Starts the download early (e.g. when the camera opens) so the first scan is quicker.
export const preloadMeterReader = () => {
  getWorker().catch(() => {});
};

const loadImage = (blob) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });

// Greyscale + contrast stretch, optionally inverted. Drum counters are white
// digits on a black window; Tesseract reads dark text on light best, so every
// image is tried both ways.
const prepareCanvas = (img, { targetHeight, invert }) => {
  const scale = targetHeight ? targetHeight / img.height : 1;
  const pad = targetHeight ? Math.round(targetHeight * 0.15) : 0;
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width + pad * 2;
  canvas.height = height + pad * 2;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = invert ? "#000" : "#fff"; // padding ends up white either way
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, pad, pad, width, height);

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = image.data;
  let min = 255;
  let max = 0;
  for (let i = 0; i < px.length; i += 4) {
    const grey = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    px[i] = grey;
    if (grey < min) min = grey;
    if (grey > max) max = grey;
  }
  const range = Math.max(1, max - min);
  for (let i = 0; i < px.length; i += 4) {
    let value = ((px[i] - min) / range) * 255;
    if (invert) value = 255 - value;
    px[i] = px[i + 1] = px[i + 2] = value;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
};

// Every digit run Tesseract found that could be a 6-box reading.
const extractCandidates = (text, ocrConfidence) => {
  const candidates = [];
  const add = (digits, exact) => candidates.push({ digits, exact, ocrConfidence });

  for (const line of text.split("\n")) {
    const runs = line.split(/\s+/).map((t) => t.replace(/\D/g, "")).filter(Boolean);
    // Drums are spaced apart, so the whole line joined is usually the reading.
    for (const run of new Set([runs.join(""), ...runs])) {
      if (run.length === TOTAL_DIGITS) add(run, true);
      else if (run.length === TOTAL_DIGITS + 1) {
        // One stray character at either end (a label or the window edge).
        add(run.slice(1), false);
        add(run.slice(0, TOTAL_DIGITS), false);
      } else if (run.length === INTEGER_DIGITS) {
        add(`${run}0`, false); // red decimal drum missed
      }
    }
  }
  return candidates;
};

const toReading = (digits) =>
  parseInt(digits.slice(0, INTEGER_DIGITS), 10) + parseInt(digits.slice(-1), 10) / 10;

const isPlausible = (digits, prevUnit) => {
  const reading = toReading(digits);
  if (reading < prevUnit) return false;
  return !prevUnit || reading - prevUnit <= MAX_PLAUSIBLE_JUMP;
};

const pickBest = (candidates, prevUnit) => {
  const score = (c) =>
    c.ocrConfidence + (isPlausible(c.digits, prevUnit) ? 100 : 0) + (c.exact ? 20 : 0);
  return candidates.sort((a, b) => score(b) - score(a))[0] ?? null;
};

/**
 * @param {Blob} blob     meter photo
 * @param {object} opts
 * @param {number} opts.prevUnit  last billed reading, used to reject misreads
 * @param {boolean} opts.cropped  true when the photo is already cropped to the digit window
 * @returns {Promise<{ok: true, digits: string, reading: string, confidence: "high"|"low"} | {ok: false, message: string}>}
 */
export const readMeterDigits = async (blob, { prevUnit = 0, cropped = false } = {}) => {
  const [worker, img] = await Promise.all([getWorker(), loadImage(blob)]);

  const passes = cropped
    ? [
        { psm: PSM_SINGLE_LINE, invert: true, targetHeight: 140 },
        { psm: PSM_SINGLE_LINE, invert: false, targetHeight: 140 },
        { psm: PSM_SPARSE_TEXT, invert: true, targetHeight: 140 },
      ]
    : [
        { psm: PSM_SPARSE_TEXT, invert: true },
        { psm: PSM_SPARSE_TEXT, invert: false },
      ];

  const candidates = [];
  for (const pass of passes) {
    await worker.setParameters({
      tessedit_pageseg_mode: pass.psm,
      tessedit_char_whitelist: "0123456789",
    });
    const canvas = prepareCanvas(img, pass);
    const { data } = await worker.recognize(canvas);
    const found = extractCandidates(data.text || "", data.confidence || 0);
    candidates.push(...found);

    console.groupCollapsed(
      `[meter OCR] psm ${pass.psm}, ${pass.invert ? "inverted" : "normal"} → ${JSON.stringify(
        (data.text || "").trim()
      )} (confidence ${Math.round(data.confidence || 0)})`
    );
    // Shows the processed image Tesseract actually read.
    console.log(
      "%c ",
      `padding: ${Math.min(60, canvas.height / 2)}px ${Math.min(200, canvas.width / 2)}px;` +
        `background: url(${canvas.toDataURL("image/png")}) center / contain no-repeat;`
    );
    console.log("raw text:", data.text);
    console.log("candidates:", found.map((c) => c.digits));
    console.groupEnd();

    const best = pickBest([...candidates], prevUnit);
    // Stop early once a clean, believable reading turns up.
    if (best?.exact && best.ocrConfidence >= 70 && isPlausible(best.digits, prevUnit)) break;
  }

  const best = pickBest(candidates, prevUnit);
  console.log("[meter OCR] result:", {
    prevUnit,
    cropped,
    picked: best?.digits ?? null,
    all: candidates.map((c) => ({
      digits: c.digits,
      exact: c.exact,
      ocrConfidence: Math.round(c.ocrConfidence),
      plausible: isPlausible(c.digits, prevUnit),
    })),
  });
  if (!best) {
    return {
      ok: false,
      message: cropped
        ? "Could not find the meter digits. Fill the box with just the digit window and avoid glare."
        : "Could not find the meter digits in this photo. Try Live Capture, or crop the photo to the digits.",
    };
  }

  const reading = toReading(best.digits).toFixed(1);
  const confident = best.exact && best.ocrConfidence >= 70 && isPlausible(best.digits, prevUnit);
  return {
    ok: true,
    digits: best.digits,
    reading,
    confidence: confident ? "high" : "low",
  };
};
