//
// Handles adding a new player
//

'use strict';

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ((request.type === 'IntentRequest')
      && (request.intent.name === 'AMAZON.HelpIntent'));
  },
  handle: function(handlerInput) {
    const res = require('../resources')(handlerInput);

    return handlerInput.responseBuilder
      .speak('Help is on the way')
      .reprompt('Help is on the way')
      .withSimpleCard(res.getString('SKILL_NAME'),
        res.getString('HELP_CARD_TEXT').replace('{0}', res.getString('SKILL_NAME')))
      .getResponse();
  },
};
