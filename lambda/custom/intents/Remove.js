//
// Handles removing a player's bet
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    if (!attributes.temp.needPlayerCount && !attributes.temp.addingPlayers
      && (request.type === 'IntentRequest')
      && ((request.intent.name === 'RemoveIntent') ||
        (request.intent.name === 'AMAZON.CancelIntent'))) {
      const player = utils.getActivePlayer(handlerInput, true);
      return (!player || (player.bets.length > 0));
    }

    // It's possible we needed them to confirm their name
    if (!attributes.temp.addingPlayers && attributes.temp.removeIntent &&
      ((request.type === 'IntentRequest')
      && (request.intent.name === 'PlayerNameIntent'))) {
      return true;
    }
    
    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    const reprompt = res.getString('REMOVE_REPROMPT');
    let speech;

    // Now let's see if we can figure out who is placing this bet
    // If not, then we will need to prompt
    const player = utils.getActivePlayer(handlerInput);
    const intent = (player && (event.request.intent.name === 'PlayerNameIntent')) 
      ? attributes.temp.removeIntent : event.request.intent;
    
    if (!player) {
      if (attributes.temp.removeIntent && (intent.name === 'PlayerNameIntent')
      && (intent.slots.Name && intent.slots.Name.value)) {
        // This means they were prompted for a name but gave one not in our roster
        // So let's echo back the name we heard and the names of the players
        speech = res.getString('BET_WRONG_NAME')
          .replace('{0}', intent.slots.Name.value)
          .replace('{1}', speechUtils.or(game.players.map((p) => p.name)));
        return handlerInput.responseBuilder
          .speak(speech)
          .reprompt(res.getString('BET_NEED_NAME'))
          .getResponse();
      }

      attributes.temp.removeIntent = attributes.temp.removeIntent || intent;
      return handlerInput.responseBuilder
        .speak(res.getString('BET_NEED_NAME'))
        .reprompt(res.getString('BET_NEED_NAME'))
        .getResponse();
    }

    attributes.temp.removeIntent = undefined;
    const removeBet = player.bets.length - 1;
    if (game.point && !player.bets[removeBet].odds && 
      ((player.bets[removeBet].type === 'PassBet') ||
       (player.bets[removeBet].type === 'DontPassBet'))) {
      // Can't remove line bets after point
      speech = res.getString('REMOVE_CANTREMOVE_PASSBET');
    } else {
      // If this is an odds bet, we need to remove odds from the base bet
      if (player.bets[removeBet].odds) {
        speech = res.getString('REMOVE_BET')
          .replace('{0}', res.getString('FORMAT_ODDSBET').replace('{0}', player.bets[removeBet].odds));
        player.bankroll += player.bets[removeBet].odds;
        player.bets[removeBet].odds = undefined;
        player.bets[removeBet].oddsPayout = undefined;
      } else {
        speech = res.getString('REMOVE_BET').replace('{0}', res.sayBet(player.bets[removeBet]));
        player.bankroll += player.bets[removeBet].amount;
        player.bets.splice(removeBet, 1);
      }
      speech += reprompt;
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
