//
// Handles stop, which will exit the skill
//

'use strict';

const ads = require('../ads');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Can always handle with Stop and Cancel
    if (request.type === 'IntentRequest') {
      if ((request.intent.name === 'AMAZON.CancelIntent')
        || (request.intent.name === 'AMAZON.StopIntent')) {
        return true;
      }

      // Can also handle No if said at end of round
      if ((request.intent.name === 'AMAZON.NoIntent')
        && (attributes.temp.roundOver = true)) {
        return true;
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(handlerInput);

    if (attributes.bot) {
      return handlerInput.responseBuilder
        .speak(res.getString('EXIT_GAME').replace('{0}', ''))
        .getResponse();
    } else {
      return new Promise((resolve, reject) => {
        ads.getAd(attributes, 'craps-party', event.request.locale, (adText) => {
          const response = handlerInput.responseBuilder
            .speak(res.getString('EXIT_GAME').replace('{0}', adText))
            .withShouldEndSession(true)
            .getResponse();
          resolve(response);
        });
      });
    }
  },
};
