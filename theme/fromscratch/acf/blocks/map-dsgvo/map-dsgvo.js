import $ from 'jquery';
import { isGoogleMapsAccepted, setGoogleMapsAccepted, removeGoogleMapsAccepted } from '../map/map.js';

/**
 * Initialize the Google Maps consent block
 */
function initGoogleMapsConsentBlock() {
  if ($('[data-google-maps-dsgvo-container]').length) {
    const hasAcceptedTitle = 'Sie haben zugestimmt, dass Daten an Google gesendet werden, um Google Maps anzuzeigen.';
    const hasNotAcceptedTitle =
      'Sie haben nicht zugestimmt, dass Daten an Google gesendet werden, um Google Maps anzuzeigen.';

    const hasAcceptedText =
      'Wenn Sie auf "Verbindung zu Google Maps trennen" klicken, wird die Verbindung zu Google Maps getrennt und es werden keine Daten mehr an Google übertragen.';
    const hasNotAcceptedText =
      'Wenn Sie auf "Verbindung zu Google Maps erlauben" klicken, wird eine Verbindung zu Google hergestellt, um Google Maps auf der Seite anzuzeigen. Dabei werden Daten an Google übertragen. Weitere Informationen finden Sie auf dieser Seite sowie in der <a href="https://policies.google.com/privacy?hl=de" target="_blank">Datenschutzerklärung von Google</a>.';

    const hasAcceptedButtonText = 'Verbindung zu Google Maps trennen';
    const hasNotAcceptedButtonText = 'Verbindung zu Google Maps erlauben';

    let html = '';
    html += '<div class="map-dsgvo__title">';
    html += isGoogleMapsAccepted() ? hasAcceptedTitle : hasNotAcceptedTitle;
    html += '</div>';

    html += '<div class="map-dsgvo__text">';
    html += isGoogleMapsAccepted() ? hasAcceptedText : hasNotAcceptedText;
    html += '</div>';

    html += '<div class="map-dsgvo__link-container">';
    html += '  <span class="map-dsgvo__link" tabindex="0">';
    html += isGoogleMapsAccepted() ? hasAcceptedButtonText : hasNotAcceptedButtonText;
    html += '  </span>';
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
