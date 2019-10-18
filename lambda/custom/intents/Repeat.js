//
// Handles repeat
//

'use strict';

const speechUtils = require('alexa-speech-utils')();
const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ((request.type === 'IntentRequest')
      && ((request.intent.name === 'AMAZON.RepeatIntent')
        || (request.intent.name === 'AMAZON.FallbackIntent')));
  },
  handle: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    let speech = '';
    let i;

    if (!attributes.temp.needPlayerCount && !attributes.temp.addingPlayers) {
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
    } else {
      speech = attributes.temp.lastResponse;
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(attributes.temp.lastReprompt)
      .getResponse();
  },
};
