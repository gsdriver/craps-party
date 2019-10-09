//
// Handles a user pressing the button to place a bet
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];

    return ((game.players.length > 0) && attributes.temp.addingPlayers &&
      (request.type === 'IntentRequest') && (request.intent.name === 'StartIntent'));
  },
  handle: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    let speech = '';
    let reprompt;

    // If this player has no money left they can't place a bet
    if (attributes.temp.addingPlayers) {
      if (game.players.length === 1) {
        speech += res.getString('BETPROMPT_STARTING_SOLO');
      } else {
        speech += res.getString('BETPROMPT_STARTING').replace('{0}', game.players.length);
      }
      utils.startGame(handlerInput);
      attributes.temp.bettingPlayer = undefined;
    } else if (game.players[attributes.temp.bettingPlayer].bankroll < game.minBet) {
      speech += res.getString('BETPROMPT_NOTENOUGH');
      reprompt = res.getString('BETPROMPT_NOTENOUGH_REPROMPT');
      // Speed this up
      speech = '<prosody rate="fast">' + speech + '</prosody>';
    } else {
      if (attributes.temp.bettingPlayer === game.shooter) {
        speech += res.getString('BETPROMPT_SHOOTER');
        reprompt = res.getString('BETPROMPT_SHOOTER_REPROMPT');
      } else {
        speech += res.getString('BETPROMPT_PLACEBET')
            .replace('{0}', utils.playerName(handlerInput, attributes.temp.bettingPlayer + 1));
        reprompt = res.getString('BETPROMPT_PLACEBET_REPROMPT')
            .replace('{0}', utils.playerName(handlerInput, attributes.temp.bettingPlayer + 1));
      }
      // Speed this up
      speech = '<prosody rate="fast">' + speech + '</prosody>';
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
