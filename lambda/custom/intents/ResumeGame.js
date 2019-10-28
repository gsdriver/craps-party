//
// Handles resuming a new game
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

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
    let speech = '';

    if ((request.type === 'IntentRequest') && (request.intent.name === 'AMAZON.YesIntent')) {
      // Let's play! First, what was the status of the last hand?
      let i;
      if (game.point) {
        speech += res.getString('READ_POINT').replace('{0}', game.point);
      }

      for (i = 0; i < game.players.length; i++) {
        const betNames = [];
        game.players[i].bets.forEach((bet) => {
          betNames.push(res.sayBet(bet));
        });

        speech += utils.playerName(handlerInput, i + 1) + ' ';
        speech += res.getString('READ_BANKROLL').replace('{0}', game.players[i].bankroll);

        if (betNames.length) {
          speech += res.getString('READ_BETS').replace('{0}', speechUtils.and(betNames));
        }
      }

      // Let's play! Do we have any personalized IDs?
      attributes.temp.resumeGame = undefined;
      attributes.temp.personalized = (game.players.filter((x) => x.personId).length > 0);
      if (!attributes.temp.personalized) {
        game.currentPlayer = 0;
      }

      return handlerInput.responseBuilder
        .speak(res.getString('RESUMEGAME_WELCOME_BACK').replace('{0}', speech))
        .reprompt(res.getString('RESUMEGAME_PLAY_REPROMPT'))
        .getResponse();
    } else if ((request.type === 'IntentRequest') && (request.intent.name === 'AMAZON.NoIntent')) {
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
