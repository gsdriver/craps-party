//
// Handles adding a new player
//

'use strict';

const utils = require('../utils');
const buttons = require('../buttons');
const seedrandom = require('seedrandom');

module.exports = {
  canHandle: function(handlerInput) {
    // You can do this via voice or if the shooter presses the button twice
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];

    // If no players, can't roll
    if (!game.players || (game.players.length === 0)) {
      return false;
    }

    // If the shooter has pressed the button previously, we will roll
    if ((request.type === 'GameEngine.InputHandlerEvent') &&
      (attributes.temp.bettingPlayer !== undefined) &&
      (attributes.temp.bettingPlayer === game.shooter)) {
      const buttonId = buttons.getPressedButton(request, attributes);
      let playerId;
      if (buttonId) {
        let i;
        for (i = 0; i < game.players.length; i++) {
          if (game.players[i].buttonId === buttonId) {
            playerId = i;
          }
        }

        if (playerId === game.shooter) {
          // Shooter pressed the button twice - roll 'em!
          return true;
        }
      }
    }

    return ((request.type === 'IntentRequest')
      && ((request.intent.name === 'RollIntent') ||
        (request.intent.name === 'AMAZON.YesIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    let speech = '';
    let reprompt = res.getString('ROLL_REPROMPT');
    let amount;
    let missingBets;
    let switchState;
    let playerNumber;
    let newShooter;
    let speechTime = 0;
    let text;

    if (attributes.temp.bettingPlayer === undefined) {
      utils.startGame(handlerInput);
    }

    // First, place bets for anyone who hasn't made a bet
    attributes.temp.roundOver = undefined;
    game.players.forEach((player) => {
      if (!utils.getLineBet(player.bets)) {
        // If there is a line bet amount, use that
        if (player.lineBet) {
          amount = (player.lineBet > player.bankroll) ? player.bankroll : player.lineBet;
        } else {
          // OK, just place a bet for them - acknowledge that we're doing this
          missingBets = true;
          amount = game.minBet;
          player.lineBet = game.minBet;
          player.passPlayer = true;
        }

        player.bets.push(utils.createLineBet(amount, player.passPlayer));
        player.bankroll -= amount;
      }
    });

    if (missingBets) {
      text = res.getString('ROLL_MISSING_BETS').replace('{0}', game.minBet);
      speech += text;
      speechTime += estimateSpeechTime(text);
    }

    // Pick two random dice rolls
    const randomValue1 = seedrandom('1' + event.session.user.userId + (game.timestamp ? game.timestamp : ''))();
    const randomValue2 = seedrandom('2' + event.session.user.userId + (game.timestamp ? game.timestamp : ''))();
    const die1 = Math.floor(randomValue1 * 6) + 1;
    const die2 = Math.floor(randomValue2 * 6) + 1;
    if (die1 == 7) {
      die1--;
    }
    if (die2 == 7) {
      die2--;
    }
    game.dice = [die1, die2];
    game.rolls = (game.rolls + 1) || 1;
    const total = game.dice[0] + game.dice[1];

    speech += '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/dice.mp3\"/> ';
    speechTime += 900;

    // Let's see if the dice fell off the table
    let offTable;
    if (game.rolls >= 4) {
      // Roll can be off table starting with fourth roll
      const randomValue = seedrandom(event.session.user.userId + (game.timestamp ? game.timestamp : ''))();
      if (Math.floor(randomValue * Math.sqrt(9 * (game.rolls - 4) + 1)) === 0) {
        offTable = true;
      }
    }
    if (offTable) {
      text = res.getString('ROLL_OFF_TABLE');
      speech += text;
      speechTime += estimateSpeechTime(text);
      speech += '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/dice.mp3\"/> ';
      speechTime += 900;
    }

    text = res.getString('ROLL_RESULT').replace('{0}', res.sayRoll(game.dice));
    speech += text;
    speechTime += estimateSpeechTime(text);

    // Figure out payouts for each player
    playerNumber = 1;
    game.players.forEach((player) => {
      let won = 0;
      let winningBets = 0;
      let lost = 0;
      player.bets.forEach((bet) => {
        if (bet.winningRolls[total]) {
          won += Math.floor(bet.amount * bet.winningRolls[total]);
          winningBets += bet.amount;

          if (bet.odds) {
            won += Math.floor(bet.odds * bet.oddsPayout);
            winningBets += bet.odds;
          }
          bet.remove = true;
        } else if (bet.losingRolls.indexOf(total) !== -1) {
          lost += bet.amount;
          if (bet.odds) {
            lost += bet.odds;
          }
          bet.remove = true;
        }
      });

      // Don't say anything if no bets won or lost
      player.amountWon = (won - lost);
      if ((won > 0) || (lost > 0)) {
        speech += res.getString('ROLL_PLAYER_NUMBER').replace('{0}', playerNumber);
        if (won > lost) {
          speech += res.getString('ROLL_NET_WIN').replace('{0}', won - lost);
        } else if (lost > won) {
          speech += res.getString('ROLL_NET_LOSE').replace('{0}', lost - won);
        } else {
          speech += res.getString('ROLL_NET_PUSH');
        }
      }
      playerNumber++;

      // Pay up! Remember we already deducted bets from their bankroll (for a loss)
      player.bankroll += (won + winningBets);
    });

    // Transition game state if necessary
    if (!game.point) {
      // Transitions to point if not 2, 3, 7, 11, or 12
      if ([2, 3, 7, 11, 12].indexOf(total) === -1) {
        game.point = total;
        switchState = true;
        speech += res.getString('ROLL_POINT_ESTABLISHED');
        if (!attributes.prompts.takeOdds) {
          attributes.prompts.takeOdds = true;
          speech += res.getString('ROLL_TAKE_ODDS');
        }
        game.players.forEach((player) => {
          utils.getLineBet(player.bets).point = total;
        });
      }
    } else {
      // Transitions to nopoint if 7 or point was hit
      if ((total === 7) || (total === game.point)) {
        game.point = undefined;
        switchState = true;
        attributes.temp.roundOver = true;
        game.rounds = (game.rounds + 1) || 1;
        if (total === 7) {
          newShooter = (game.players.length > 1);
          speech += res.getString('ROLL_SEVEN_CRAPS');
        } else {
          speech += res.getString('ROLL_GOT_POINT');
        }
        reprompt = res.getString('ROLL_COME_REPROMPT');
      }
    }

    // Now go through and update bets - remove one-time bets
    // or change winning numbers for the line bet
    game.players.forEach((player) => {
      player.bets = player.bets.filter((bet) => {
        if (switchState) {
          if ((bet.type === 'PassBet') && game.point) {
            bet.winningRolls = {};
            bet.winningRolls[game.point] = 1;
            bet.losingRolls = [7];
          } else if ((bet.type === 'DontPassBet') && !game.point) {
            bet.winningRolls = {7: 1};
            bet.losingRolls = [game.point];
          }
        }
        return (!bet.remove);
      });
    });

    // Now let's update the scores
    game.timestamp = Date.now();
    playerNumber = 1;
    game.players = game.players.filter((player) => {
      let keepPlayer = true;
      if (player.bankroll > player.high) {
        player.high = player.bankroll;
      }
      // If they have no units left, and they no longer have any
      // bets in play, then reset the bankroll
      if ((player.bankroll < game.minBet) &&
        (!player.bets || (player.bets.length == 0))) {
        if (game.canReset) {
          player.bankroll = game.startingBankroll;
          speech += res.getString('ROLL_BUSTED').replace('{0}', playerNumber);
        } else {
          speech += res.getString('ROLL_BUSTED_PLAYEROUT').replace('{0}', playerNumber);
          keepPlayer = false;
        }
      }
      playerNumber++;
      return keepPlayer;
    });

    if (game.players.length === 0) {
      speech += res.getString('ROLL_ALLPLAYERS_OUT');
      return handlerInput.responseBuilder
        .speak(speech)
        .withShouldEndSession(true)
        .getResponse();
    } else {
      // Go to the next shooter if they crapped out
      if (newShooter) {
        game.shooter = (game.shooter + 1) % game.players.length;
        speech += res.getString('ROLL_NEW_SHOOTER').replace('{0}', game.shooter + 1);
      }
      attributes.temp.bettingPlayer = game.shooter;
      buttons.startInputHandler(handlerInput);

      // Now do an animation sequence for each player
      let i;
      for (i = 0; i < game.players.length; i++) {
        buttons.addRollAnimation(handlerInput, speechTime, i);
      }

      // And reprompt
      speech += reprompt;
      return handlerInput.responseBuilder
        .speak(speech)
        .reprompt(reprompt)
        .getResponse();
      }
  },
};

function estimateSpeechTime(speech) {
  return 70 * speech.length;
}
