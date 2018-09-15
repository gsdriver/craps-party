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

    // Fail silently if this was an unhandled button event
    if (event.request.type !== 'GameEngine.InputHandlerEvent') {
      // If adding players, tell them to press a button first
      if (attributes.temp.addingPlayers) {
        speech = res.getString('UNKNOWN_ADDING_PLAYERS');
      } else if (attributes.temp.bettingPlayer === undefined) {
        speech = res.getString('UNKNOWN_BETTING_PLAYER');
      } else {
        speech = res.getString('UNKNOWN_INTENT');
      }

      return handlerInput.responseBuilder
        .speak(speech)
        .reprompt(res.getString('UNKNOWN_INTENT_REPROMPT'))
        .getResponse();
    }
  },
};
