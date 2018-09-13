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

    // Fail silently if this was an unhandled button event
    if (event.request.type !== 'GameEngine.InputHandlerEvent') {
      return handlerInput.responseBuilder
        .speak(res.getString('UNKNOWN_INTENT'))
        .reprompt(res.getString('UNKNOWN_INTENT_REPROMPT'))
        .getResponse();
    }
  },
};
