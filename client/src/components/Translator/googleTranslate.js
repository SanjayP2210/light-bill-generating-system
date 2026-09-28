export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "gu", label: "Gujarati" },
];

const CALLBACK_NAME = "googleTranslateElementInit";
const WIDGET_ID = "google_translate_element";

let initPromise = null;

export const initGoogleTranslate = () => {
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve) => {
    if (window.google?.translate?.TranslateElement) {
      resolve();
      return;
    }

    window[CALLBACK_NAME] = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.map((lang) => lang.code).join(","),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        WIDGET_ID
      );
      resolve();
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `//translate.google.com/translate_a/element.js?cb=${CALLBACK_NAME}`;
    document.body.appendChild(script);
  });

  return initPromise;
};

const COOKIE_NAME = "googtrans";

export const getCurrentLanguage = () => {
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=/en/(\\w+)`));
  return match ? match[1] : "en";
};

// Google's translate widget reads this cookie on page load to decide what to
// translate the page into. Driving the hidden <select> with a synthetic
// "change" event used to work but Google's script no longer reliably reacts
// to programmatic events, so the cookie + reload is the dependable approach.
const setCookie = (value) => {
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  const entry = value ? `${COOKIE_NAME}=${value};` : `${COOKIE_NAME}=; ${expired}`;
  document.cookie = `${entry} path=/;`;
  document.cookie = `${entry} path=/; domain=${window.location.hostname};`;
};

export const setLanguage = (code) => {
  setCookie(code === "en" ? null : `/en/${code}`);
  window.location.reload();
};
