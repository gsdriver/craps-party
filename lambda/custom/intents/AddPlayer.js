//
// Handles adding a new player
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return attributes.temp.addingPlayers &&
      ((request.type === 'IntentRequest')
      && (request.intent.name === 'PlayerNameIntent'));
  },
  handle: async function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    const name = (event.request.intent && event.request.intent.slots
      && event.request.intent.slots.Name) ? event.request.intent.slots.Name.value : undefined;

    // Acknowledge for acknowledgement of the name
    if (!name) {
      return handlerInput.responseBuilder
        .speak(res.getString('ADDPLAYER_NEED_NAME'))
        .reprompt(res.getString('ADDPLAYER_NEED_NAME'))
        .getResponse();
    } else {
      // Make sure we haven't heard this person before
      if (event.context.System.person && event.context.System.person.personId) {
        const idx = game.players.map((p) => p.personId).indexOf(event.context.System.person.personId);
        if (idx > -1) {
          return handlerInput.responseBuilder
            .speak(res.getString('ADDPLAYER_SAME_PERSON').replace('{0}', game.players[idx].name))
            .reprompt(res.getString('ADDPLAYER_SAME_PERSON_REPROMPT'))
            .getResponse();
        }
      }

      attributes.temp.confirmName = name;
      attributes.temp.personId = (event.context.System.person) ? 
        event.context.System.person.personId : undefined;
      return handlerInput.responseBuilder
        .speak(res.getString('ADDPLAYER_CONFIRM_NAME').replace('{0}', name))
        .reprompt(res.getString('ADDPLAYER_CONFIRM_NAME').replace('{0}', name))
        .getResponse();
    }
  },
};
