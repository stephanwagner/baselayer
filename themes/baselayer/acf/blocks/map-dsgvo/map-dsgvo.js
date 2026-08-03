import { isGoogleMapsAccepted, setGoogleMapsAccepted, removeGoogleMapsAccepted } from '../map/map.js';

const SCOPE = '.bl-wp-block.-acf-block';

function initGoogleMapsConsentBlock() {
  const containers = document.querySelectorAll(`${SCOPE}[data-google-maps-dsgvo-container]`);
  if (!containers.length) {
    return;
  }

  const hasAcceptedTitle = 'Sie haben der Verbindung zu Google Maps zugestimmt.';
  const hasNotAcceptedTitle = 'Sie haben der Verbindung zu Google Maps derzeit nicht zugestimmt.';

  const hasNotAcceptedTextP1 =
    'Wenn Sie Ihre Zustimmung erteilen, kann Google Maps auf dieser Website geladen werden. ' +
    'Dabei wird eine Verbindung zu Google hergestellt und es können personenbezogene Daten (z. B. Ihre IP-Adresse) an Google übertragen werden.';
  const hasNotAcceptedTextP2 =
    'Weitere Informationen finden Sie in unserer Datenschutzerklärung ' +
    'sowie in der <a href="https://policies.google.com/privacy?hl=de" target="_blank">Datenschutzerklärung von Google</a>.';
  const hasNotAcceptedText = '<p>' + hasNotAcceptedTextP1 + '</p><p>' + hasNotAcceptedTextP2 + '</p>';

  const hasAcceptedTextP1 = 'Sie können Ihre Zustimmung jederzeit widerrufen. Nach dem Widerruf wird Google Maps auf dieser Website nicht mehr geladen.';
  const hasAcceptedText = '<p>' + hasAcceptedTextP1 + '</p>';

  const hasAcceptedButtonText = 'Verbindung zu Google Maps widerrufen';
  const hasNotAcceptedButtonText = 'Verbindung zu Google Maps erlauben';

  let html = '';
  html += '<div class="map-dsgvo__title">';
  html += isGoogleMapsAccepted() ? hasAcceptedTitle : hasNotAcceptedTitle;
  html += '</div>';

  html += '<div class="map-dsgvo__text">';
  html += isGoogleMapsAccepted() ? hasAcceptedText : hasNotAcceptedText;
  html += '</div>';

  html += '<div class="map-dsgvo__link-container">';
  html += '  <div class="map-dsgvo__link button -outline -small" tabindex="0">';
  html += isGoogleMapsAccepted() ? hasAcceptedButtonText : hasNotAcceptedButtonText;
  html += '  </div>';
  html += '</div>';

  containers.forEach((container) => {
    container.innerHTML = html;
  });

  document.querySelectorAll('.map-dsgvo__link').forEach((link) => {
    link.addEventListener('click', () => {
      if (isGoogleMapsAccepted()) {
        removeGoogleMapsAccepted();
        document.querySelectorAll('.map-dsgvo__title').forEach((el) => {
          el.innerHTML = hasNotAcceptedTitle;
        });
        document.querySelectorAll('.map-dsgvo__text').forEach((el) => {
          el.innerHTML = hasNotAcceptedText;
        });
        document.querySelectorAll('.map-dsgvo__link').forEach((el) => {
          el.innerHTML = hasNotAcceptedButtonText;
        });
      } else {
        setGoogleMapsAccepted();
        document.querySelectorAll('.map-dsgvo__title').forEach((el) => {
          el.innerHTML = hasAcceptedTitle;
        });
        document.querySelectorAll('.map-dsgvo__text').forEach((el) => {
          el.innerHTML = hasAcceptedText;
        });
        document.querySelectorAll('.map-dsgvo__link').forEach((el) => {
          el.innerHTML = hasAcceptedButtonText;
        });
      }
    });
  });
}

initGoogleMapsConsentBlock();
