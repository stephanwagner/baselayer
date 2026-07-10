import $ from 'jquery';
import { isGoogleMapsAccepted, setGoogleMapsAccepted, removeGoogleMapsAccepted } from '../map/map.js';

/**
 * Initialize the Google Maps consent block
 */
function initGoogleMapsConsentBlock() {
  if ($('[data-google-maps-dsgvo-container]').length) {
    const hasAcceptedTitle = 'Sie haben der Verbindung zu Google Maps zugestimmt.';
    const hasNotAcceptedTitle = 'Sie haben der Verbindung zu Google Maps derzeit nicht zugestimmt.';

    const hasNotAcceptedTextP1 =
      'Wenn Sie Ihre Zustimmung erteilen, kann Google Maps auf dieser Website geladen werden. ' +
      'Dabei wird eine Verbindung zu Google hergestellt und es können personenbezogene Daten (z. B. Ihre IP-Adresse) an Google übertragen werden.';
    const hasNotAcceptedTextP2 =
      'Weitere Informationen finden Sie in unserer Datenschutzerklärung' +
      'sowie in der <a href="https://policies.google.com/privacy?hl=de" target="_blank">Datenschutzerklärung von Google.</a>';
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

    $('[data-google-maps-dsgvo-container]').html(html);

    $('.map-dsgvo__link').on('click', function () {
      if (isGoogleMapsAccepted()) {
        removeGoogleMapsAccepted();
        $('.map-dsgvo__title').html(hasNotAcceptedTitle);
        $('.map-dsgvo__text').html(hasNotAcceptedText);
        $('.map-dsgvo__link').html(hasNotAcceptedButtonText);
      } else {
        setGoogleMapsAccepted();
        $('.map-dsgvo__title').html(hasAcceptedTitle);
        $('.map-dsgvo__text').html(hasAcceptedText);
        $('.map-dsgvo__link').html(hasAcceptedButtonText);
      }
    });
  }
}

// Consent block
initGoogleMapsConsentBlock();
