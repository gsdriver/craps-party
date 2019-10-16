//
// Handles resuming a new game
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // We'll handle anything if they are still in resume game mode
    // Although you should have said Yes or No
    return attributes.temp.resumeGame;
  },
  handle: async function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);

    if (request.intent.name === 'AMAZON.YesIntent') {
      // Let's play! Do we have any personalized IDs?
      attributes.temp.resumeGame = undefined;
      attributes.temp.personalized = (game.players.filter((x) => x.personId).length > 0);
      if (attributes.temp.personalized) {
        return handlerInput.responseBuilder
          .speak(res.getString('CONFIRMNAME_PLAY_PERSONAL'))
          .reprompt(res.getString('CONFIRMNAME_PLAY_REPROMPT'))
          .getResponse();
      } else {
        // Players will need to go in turn
        game.currentPlayer = 0;
        return handlerInput.responseBuilder
          .speak(res.getString('CONFIRMNAME_PLAY_NONPERSONAL').replace('{0}', game.players[game.currentPlayer].name))
          .reprompt(res.getString('CONFIRMNAME_PLAY_REPROMPT'))
          .getResponse();
      }
    } else if (request.intent.name === 'AMAZON.NoIntent') {
      // OK, go into prompt for name mode
      attributes.temp.resumeGame = undefined;
      attributes.temp.needPlayerCount = true;
      game.players = [];
      speech += res.getString('RESUMEGAME_NO').replace('{0}', res.getString('SKILL_NAME'));
      return handlerInput.responseBuilder
        .speak(speech)
        .reprompt(res.getString('RESUMEGAME_NO_REPROMPT'))
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(res.getString('RESUMEGAME_TRYAGAIN'))
        .reprompt(res.getString('RESUMEGAME_TRYAGAIN'))
        .getResponse();
    }
  },
};
