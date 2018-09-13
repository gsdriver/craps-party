//
// Handles repeat
//

'use strict';

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ((request.type === 'IntentRequest')
      && ((request.intent.name === 'AMAZON.RepeatIntent')
        || (request.intent.name === 'AMAZON.FallbackIntent')));
  },
  handle: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.responseBuilder
      .speak(attributes.temp.lastResponse)
      .reprompt(attributes.temp.lastReprompt)
      .getResponse();
  },
};
