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
      let speech = '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> ';
      speech += res.getString('LAUNCH_WELCOME_BUTTON').replace('{0}', res.getString('SKILL_NAME'));
      return handlerInput.responseBuilder
        .speak(speech)
        .reprompt(res.getString('LAUNCH_REPROMPT'))
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(res.getString('LAUNCH_NEED_BUTTONS').replace('{0}', res.getString('SKILL_NAME')))
        .withShouldEndSession(true)
        .getResponse();
    }
  },
};
