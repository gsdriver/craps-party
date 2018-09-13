//
// Handles launching the skill
//

'use strict';

const buttons = require('../buttons');

module.exports = {
  canHandle: function(handlerInput) {
    return handlerInput.requestEnvelope.session.new ||
      (handlerInput.requestEnvelope.request.type === 'LaunchRequest');
  },
  handle: function(handlerInput) {
    const res = require('../resources')(handlerInput);
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Try to keep it simple
    if (buttons.supportButtons(handlerInput)) {
      attributes.temp.addingPlayers = true;
      return handlerInput.responseBuilder
        .speak(res.getString('LAUNCH_WELCOME_BUTTON'))
        .reprompt(res.getString('LAUNCH_REPROMPT'))
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(res.getString('LAUNCH_NEED_BUTTONS'))
        .withShouldEndSession(true)
        .getResponse();
    }
  },
};
