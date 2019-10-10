//
// Utility functions
//

'use strict';

const Alexa = require('ask-sdk');

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
  getBaseBet: function(player, attributes) {
    const game = attributes[attributes.currentGame];
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

    return game.players[playerNumber - 1].name;
  },
  getActivePlayer: function(handlerInput, test) {
    let intent = handlerInput.requestEnvelope.request.intent;
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    let player;

    if (game.players.length === 1) {
      // It's obvious who it is
      return game.players[0];
    }

    if (intent.name === 'PlayerNameIntent') {
      // Are they in the list?
      const name = (intent.slots && event.request.intent.slots.Name && event.request.intent.slots.Name.value)
        ? event.request.intent.slots.Name.value.toLowerCase() : undefined;
      const idx = (name) 
        ? game.players.map((p) => p.name.toLowerCase()).indexOf(name) : -1;

      if (idx > -1) {
        // Found them - let's use the bet they were trying to make last time
        if (!test) {
          game.currentPlayer = (!attributes.temp.personalized) ? idx : undefined;
        }
        player = game.players[idx];
        intent = attributes.temp.bettingIntent;
      }
    } else if (!attributes.temp.personalized) {
      if (game.currentPlayer !== undefined) {
        player = game.players[game.currentPlayer];
      }
    } else if (event.context.System.person && event.context.System.person.personId) {
      // Look this player up in our array
      const idx = game.players.map((p) => p.personId).indexOf(event.context.System.person.personId);
      if (idx > -1) {
        player = game.players[idx];
      }
    }

    return {player, intent};
  },
};
