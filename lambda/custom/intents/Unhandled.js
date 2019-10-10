//
// Unhandled intents
//

'use strict';

module.exports = {
  canHandle: function(handlerInput) {
    return true;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const res = require('../resources')(handlerInput);
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let speech;

    // If adding players, tell them to say a name
    if (attributes.temp.addingPlayers) {
      speech = res.getString('UNKNOWN_ADDING_PLAYERS');
    } else {
      speech = res.getString('UNKNOWN_INTENT');
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(res.getString('UNKNOWN_INTENT_REPROMPT'))
      .getResponse();
  },
};
