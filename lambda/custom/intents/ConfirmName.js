//
// Handles adding a new player
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return attributes.temp.confirmName &&
      ((request.type === 'IntentRequest')
      && ((request.intent.name === 'AMAZON.YesIntent') || (request.intent.name === 'AMAZON.NoIntent')));
  },
  handle: async function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);

    if (request.intent.name === 'AMAZON.YesIntent') {
      let personId;

      if (attributes.temp.personId) {
        // Use this one
        personId = attributes.temp.personId;
      } else if (event.context.System.person && event.context.System.person.personId) {
        // Use this only if not already assigned
        const idx = game.players.map((p) => p.personId).indexOf(event.context.System.person.personId);
        personId = (idx > -1) ? undefined : event.context.System.person.personId;
      }

      game.players.push({
        name: attributes.temp.confirmName,
        personId: personId,
        bankroll: game.startingBankroll,
        bets: [],
      });

      attributes.temp.confirmName = undefined;
      attributes.temp.personId = undefined;
      
      // Make note of whether we have person IDs or not
      // If there were no person IDs that came through, we'll fall back
      // to a "non-personalized" experience and prompt people in turn
      if (personId) {
        attributes.temp.personalized = true;
      }

      // Do we have another player to add?
      if (game.players.length < attributes.temp.addingPlayers) {
        return handlerInput.responseBuilder
          .speak(res.getString('CONFIRMNAME_NEXT'))
          .reprompt(res.getString('CONFIRMNAME_NEXT_REPROMPT'))
          .getResponse();
      } else {
        // Let's play!
        attributes.temp.addingPlayers = undefined;
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
      }
    } else {
      attributes.temp.confirmName = undefined;
      return handlerInput.responseBuilder
      .speak(res.getString('CONFIRMNAME_TRYAGAIN'))
      .reprompt(res.getString('CONFIRMNAME_TRYAGAIN'))
      .getResponse();
    }
  },
};
