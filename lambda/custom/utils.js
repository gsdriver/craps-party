//
// Utility functions
//

'use strict';

const Alexa = require('ask-sdk');
const buttons = require('./buttons');

module.exports = {
  drawTable: function(handlerInput) {
    const response = handlerInput.responseBuilder;
    const event = handlerInput.requestEnvelope;
    const res = require('./resources')(handlerInput);

    // If this is a Show, show the background image
    if (event.context && event.context.System &&
      event.context.System.device &&
      event.context.System.device.supportedInterfaces &&
      event.context.System.device.supportedInterfaces.Display) {
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      attributes.display = true;

      // Add background image
      const game = attributes[attributes.currentGame];
      let imageURL = 'https://s3.amazonaws.com/garrett-alexa-images/craps/';
      if (game && game.dice && (game.dice.length == 2)) {
        imageURL += ('craps' + game.dice[0] + game.dice[1] + '.png');
      } else {
        imageURL += 'crapstable.png';
      }

      const image = new Alexa.ImageHelper()
        .withDescription('')
        .addImageInstance(imageURL)
        .getImage();
      const textContent = new Alexa.PlainTextContentHelper()
        .withPrimaryText(res.getString('SKILL_NAME'))
        .getTextContent();
      response.addRenderTemplateDirective({
        type: 'BodyTemplate1',
        backButton: 'HIDDEN',
        textContent: textContent,
        backgroundImage: image,
      });
    }
  },
  startGame: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];

    attributes.temp.addingPlayers = undefined;
    game.startingPlayerCount = game.players.length;
    game.shooter = 0;
    buttons.startInputHandler(handlerInput);

    // At start of game, turn off buttons
    buttons.turnOffButtons(handlerInput);
    game.players.forEach((player) => {
      buttons.lightPlayer(handlerInput, player.buttonId, player.buttonColor);
    });
  },
  createLineBet: function(amount, pass) {
    let bet;

    if (pass) {
      bet = {
        type: 'PassBet',
        amount: amount,
        winningRolls: {7: 1, 11: 1},
        losingRolls: [2, 3, 12],
      };
    } else {
      bet = {
        type: 'DontPassBet',
        amount: amount,
        winningRolls: {2: 1, 3: 1, 12: 0},
        losingRolls: [7, 11],
      };
    }

    return bet;
  },
  getLineBet: function(bets) {
    let linebet;

    if (bets) {
      bets.forEach((bet) => {
        if ((bet.type === 'PassBet') || (bet.type === 'DontPassBet')) {
          linebet = bet;
        }
      });
    }

    return linebet;
  },
  getBaseBet: function(attributes) {
    const game = attributes[attributes.currentGame];
    const player = game.players[attributes.temp.bettingPlayer];
    let i;
    let baseBet;

    if (player.bets) {
      for (i = player.bets.length - 1; i >= 0; i--) {
        if ((player.bets[i].type === 'PassBet')
          || (player.bets[i].type === 'DontPassBet')) {
          if (game.point) {
            baseBet = player.bets[i];
            break;
          }
        }
      }
    }

    return baseBet;
  },
  playerName: function(handlerInput, playerNumber) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('./resources')(handlerInput);

    if (game.players.length === 1) {
      return res.getString('SOLO_PLAYER');
    } else {
      return res.getString('PLAYER_NUMBER').replace('{0}', playerNumber);
    }
  },
};
