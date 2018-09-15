//
// Handles adding a new player
//

'use strict';

const buttons = require('../buttons');
const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];

    // Add a player by pressing a button that we haven't seen before
    if ((attributes.temp.addingPlayers) &&
      (request.type === 'GameEngine.InputHandlerEvent')) {
      const buttonId = buttons.getPressedButton(request, attributes);
      if (buttonId) {
        let existingPlayer;
        game.players.forEach((player) => {
          if (player.buttonId === buttonId) {
            existingPlayer = true;
          }
        });

        if (!existingPlayer) {
          // New button pressed!
          attributes.temp.buttonId = buttonId;
          return true;
        }
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    let speech = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01"/> ';
    let reprompt;

    game.timestamp = Date.now();
    buttons.lightPlayer(handlerInput,
      attributes.temp.buttonId,
      buttons.getPlayerColor(game.players.length));
    game.players.push({
      buttonId: attributes.temp.buttonId,
      bankroll: game.startingBankroll,
      bets: [],
    });
    attributes.temp.buttonId = undefined;

    if (game.players.length === 1) {
      speech += res.getString('ADDPLAYER_FIRSTPLAYER')
        .replace('{0}', game.players.length);
      reprompt = res.getString('ADDPLAYER_NEWPLAYER_REPROMPT');
    } else if (game.players.length < 4) {
      speech += res.getString('ADDPLAYER_NEWPLAYER')
        .replace('{0}', game.players.length);
      reprompt = res.getString('ADDPLAYER_NEWPLAYER_REPROMPT');
    } else {
      speech += res.getString('ADDPLAYER_MAXPLAYERS');
      reprompt = res.getString('ADDPLAYER_MAXPLAYERS_REPROMPT');
      utils.startGame(handlerInput);
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
