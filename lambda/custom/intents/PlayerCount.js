//
// Handles getting the number of players
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    // If they just said a number, we'll ask for more details I guess
    return attributes.temp.needPlayerCount &&
       ((request.type === 'IntentRequest')
        && (request.intent.name === 'PlayerCountIntent'));
  },
  handle: async function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    const event = handlerInput.requestEnvelope;
    const players = (event.request.intent && event.request.intent.slots
      && event.request.intent.slots.Players) ? event.request.intent.slots.Players.value : 0;

    // If they are supposed to be giving a player count but didn't, tell them
    if (!players) {
      return handlerInput.responseBuilder
        .speak(res.getString('PLAYERCOUNT_NEED_COUNT'))
        .reprompt(res.getString('PLAYERCOUNT_NEED_COUNT'))
        .getResponse();
    } else if ((players < 1) || (players > 4)) {
      return handlerInput.responseBuilder
        .speak(res.getString('PLAYERCOUNT_BAD_COUNT'))
        .reprompt(res.getString('PLAYERCOUNT_BAD_COUNT_REPROMPT'))
        .getResponse();      
    } else {        
      attributes.temp.needPlayerCount = undefined;
      attributes.temp.addingPlayers = players;
      return handlerInput.responseBuilder
        .speak(res.getString('GETPLAYER_NAME').replace('{0}', 1))
        .reprompt(res.getString('GETPLAYER_NAME_REPROMPT'))
        .getResponse();      
    }
  },
};
