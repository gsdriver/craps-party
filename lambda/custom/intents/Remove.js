//
// Handles removing a player's bet
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    if ((attributes.temp.bettingPlayer !== undefined)
      && (request.type === 'IntentRequest')
      && ((request.intent.name === 'RemoveIntent') ||
        (request.intent.name === 'AMAZON.CancelIntent'))) {
      const game = attributes[attributes.currentGame];
      const player = game.players[attributes.temp.bettingPlayer];
      return (player.bets.length > 0);
    }

    return false;
  },
  handle: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const player = game.players[attributes.temp.bettingPlayer];
    const res = require('../resources')(handlerInput);
    const reprompt = res.getString('REMOVE_REPROMPT');
    let speech;

    const removeBet = player.bets.length - 1;
    if (game.point &&
      ((player.bets[removeBet].type === 'PassBet') ||
       (player.bets[removeBet].type === 'DontPassBet'))) {
      // Can't remove line bets after point
      speech = res.getString('REMOVE_CANTREMOVE_PASSBET');
    } else {
      // If this is an odds bet, we need to remove odds from the base bet too
      if (player.bets[removeBet].type === 'OddsBet') {
        const baseBet = utils.getBaseBet(attributes);
        baseBet.odds = undefined;
        baseBet.oddsPayout = undefined;
      }

      speech = res.getString('REMOVE_BET').replace('{0}', res.sayBet(player.bets[removeBet]));
      player.bankroll += player.bets[removeBet].amount;
      player.bets.splice(removeBet, 1);
      speech += reprompt;
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
