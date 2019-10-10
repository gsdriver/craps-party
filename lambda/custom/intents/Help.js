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
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    let speech;

    if (attributes.temp.addingPlayers) {
      speech = (game.players.length > 0)
        ? res.getString('HELP_ADDING_PLAYERS_ADDED') : res.getString('HELP_ADDING_PLAYERS');
    } else {
      speech = res.getString('HELP_INGAME');
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(res.getString('HELP_REPROMPT'))
      .withSimpleCard(res.getString('SKILL_NAME'),
        res.getString('HELP_CARD_TEXT').replace('{0}', res.getString('SKILL_NAME')))
      .getResponse();
  },
};
