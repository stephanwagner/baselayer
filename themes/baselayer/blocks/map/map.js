const SCOPE = '.bl-wp-block.-baselayer-block';
const googleMapsLocalStorageKey = 'google-maps-accepted';

const googleMapsWrappers = document.querySelectorAll(`${SCOPE} [data-google-maps-wrapper]`);
const googleMapsInitButtons = document.querySelectorAll(`${SCOPE} [data-google-maps-accept-button]`);

if (googleMapsWrappers.length) {
  if (isGoogleMapsAccepted()) {
    initGoogleMaps();
  } else {
    showGoogleMapsDsgvo();
  }

  googleMapsInitButtons.forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      setGoogleMapsAccepted();
      initGoogleMaps();
    });
  });
}

/**
 * @returns {boolean}
 */
export function isGoogleMapsAccepted() {
  return (
    localStorage.getItem(googleMapsLocalStorageKey) === '1' ||
    (typeof window.BorlabsCookie !== 'undefined' && window.BorlabsCookie.Consents.hasConsent('maps'))
  );
}
window.isGoogleMapsAccepted = isGoogleMapsAccepted;

export function setGoogleMapsAccepted() {
  localStorage.setItem(googleMapsLocalStorageKey, '1');
}
window.setGoogleMapsAccepted = setGoogleMapsAccepted;

export function removeGoogleMapsAccepted() {
  localStorage.removeItem(googleMapsLocalStorageKey);
}
window.removeGoogleMapsAccepted = removeGoogleMapsAccepted;

/**
 * @returns {HTMLIFrameElement}
 */
function createGoogleMapsEmbed(type, lat, lng, address, zoom = 14) {
  let url;

  if (type == 'address' && address) {
    address = encodeURIComponent(address);
    url = `https://www.google.com/maps?q=${address}&z=${zoom}&output=embed`;
  } else {
    lat = lat || 51.477928;
    lng = lng || -0.001545;
    url = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  }

  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.width = '600';
  iframe.height = '450';
  iframe.style.border = '0';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';

  return iframe;
}

function showGoogleMapsDsgvo() {
  document.querySelectorAll(`${SCOPE} [data-google-maps-notice-container]`).forEach((el) => {
    el.classList.add('-active');
  });
}

function hideGoogleMapsDsgvo() {
  document.querySelectorAll(`${SCOPE} [data-google-maps-notice-container]`).forEach((el) => {
    el.classList.remove('-active');
  });
}

function showGoogleMapsCanvas() {
  document.querySelectorAll(`${SCOPE} [data-google-maps-canvas]`).forEach((el) => {
    el.classList.add('-active');
  });
}

function initGoogleMaps() {
  hideGoogleMapsDsgvo();

  document.querySelectorAll(`${SCOPE} [data-google-maps-wrapper]`).forEach((wrapper) => {
    const type = wrapper.getAttribute('data-type');
    const address = wrapper.getAttribute('data-address');
    const lat = wrapper.getAttribute('data-lat') || 0;
    const lng = wrapper.getAttribute('data-lng') || 0;
    const zoom = wrapper.getAttribute('data-zoom') || 14;

    const iframe = createGoogleMapsEmbed(type, lat, lng, address, zoom);
    const target = wrapper.querySelector('[data-google-maps-canvas]');
    if (target) {
      target.replaceChildren(iframe);
    }
    showGoogleMapsCanvas();
  });
}
