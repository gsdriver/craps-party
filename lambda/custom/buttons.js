//
// Echo Button support functions
//

'use strict';

module.exports = {
  supportButtons: function(handlerInput) {
    const localeList = ['en-US', 'en-GB'];
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const locale = handlerInput.requestEnvelope.request.locale;

    return (!process.env.NOBUTTONS &&
      (localeList.indexOf(locale) >= 0) &&
      (attributes.platform !== 'google') && !attributes.bot);
  },
  getPressedButton: function(request, attributes) {
    const gameEngineEvents = request.events || [];
    let buttonId;

    gameEngineEvents.forEach((engineEvent) => {
      // in this request type, we'll see one or more incoming events
      // corresponding to the StartInputHandler we sent above
      if (engineEvent.name === 'timeout') {
        console.log('Timed out waiting for button');
      } else if (engineEvent.name === 'button_down_event') {
        // save id of the button that triggered event
        console.log('Received button down request');
        buttonId = engineEvent.inputEvents[0].gadgetId;
      }
    });

    return buttonId;
  },
  getPlayerColor: function(player) {
    const colors = ['960DF3', '0000FF', 'FF6600', 'FFFF00'];
    return ((player >= 0) && (player < colors.length)) ? colors[player] : 'FFFFFF';
  },
  startInputHandler: function(handlerInput) {
    if (module.exports.supportButtons(handlerInput)) {
      // We'll allow them to press the button again if we haven't already
      const response = handlerInput.responseBuilder.getResponse();
      let ignore;

      if (response.directives) {
        response.directives.forEach((directive) => {
          if (directive.type === 'GameEngine.StartInputHandler') {
            ignore = true;
          }
        });
      }

      if (!ignore) {
        const inputDirective = {
          'type': 'GameEngine.StartInputHandler',
          'timeout': 90000,
          'recognizers': {
            'button_down_recognizer': {
              'type': 'match',
              'fuzzy': false,
              'anchor': 'end',
              'pattern': [{
                'action': 'down',
              }],
            },
          },
          'events': {
            'button_down_event': {
              'meets': ['button_down_recognizer'],
              'reports': 'matches',
              'shouldEndInputHandler': false,
            },
          },
        };
        handlerInput.responseBuilder.addDirective(inputDirective);
      }
    }
  },
  rollCallInputHandler: function(handlerInput) {
    if (module.exports.supportButtons(handlerInput)) {
      const inputDirective = {
        'type': 'GameEngine.StartInputHandler',
        'timeout': 40000,
        'recognizers': {
          'button_down_recognizer': {
            'type': 'match',
            'fuzzy': false,
            'anchor': 'end',
            'pattern': [{
              'action': 'down',
            }],
          },
        },
        'events': {
          'button_down_event': {
            'meets': ['button_down_recognizer'],
            'reports': 'matches',
            'shouldEndInputHandler': false,
          },
          'timeout': {
            'meets': ['timed out'],
            'reports': 'history',
            'shouldEndInputHandler': true,
          },
        },
      };
      handlerInput.responseBuilder.addDirective(inputDirective);
    }
  },
  buildButtonDownAnimationDirective: function(handlerInput, targetGadgets) {
    if (module.exports.supportButtons(handlerInput)) {
      const buttonDownDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': targetGadgets,
        'parameters': {
          'animations': [{
            'repeat': 1,
            'targetLights': ['1'],
            'sequence': [{
              'durationMs': 500,
              'color': 'FFFFFF',
              'intensity': 255,
              'blend': false,
            }],
          }],
          'triggerEvent': 'buttonDown',
          'triggerEventTimeMs': 0,
        },
      };
      handlerInput.responseBuilder.addDirective(buttonDownDirective);
    }
  },
  turnOffButtons: function(handlerInput) {
    if (module.exports.supportButtons(handlerInput)) {
      const turnOffButtonDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': [],
        'parameters': {
          'animations': [{
            'repeat': 1,
            'targetLights': ['1'],
            'sequence': [
              {
                'durationMs': 400,
                'color': '000000',
                'blend': false,
              },
            ],
          }],
          'triggerEvent': 'none',
          'triggerEventTimeMs': 0,
        },
      };

      handlerInput.responseBuilder
        .addDirective(turnOffButtonDirective);
    }
  },
  lightPlayer: function(handlerInput, buttonId, buttonColor) {
    if (module.exports.supportButtons(handlerInput)) {
      const buttonIdleDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': [buttonId],
        'parameters': {
          'animations': [{
            'repeat': 1,
            'targetLights': ['1'],
            'sequence': [],
          }],
          'triggerEvent': 'none',
          'triggerEventTimeMs': 0,
        },
      };

      buttonIdleDirective.parameters.animations[0].sequence.push({
        'durationMs': 60000,
        'color': buttonColor,
        'blend': false,
      });
      handlerInput.responseBuilder.addDirective(buttonIdleDirective);
    }
  },
  addLaunchAnimation: function(handlerInput) {
    if (module.exports.supportButtons(handlerInput)) {
      // Flash the buttons white during roll call
      // This will intensify until it completes,
      // after the timeout it will auto-start the game
      const buttonIdleDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': [],
        'parameters': {
          'animations': [{
            'repeat': 1,
            'targetLights': ['1'],
            'sequence': [],
          }],
          'triggerEvent': 'none',
          'triggerEventTimeMs': 0,
        },
      };

      // Add to the animations array
      // This ends up finishing in about 40 seconds
      const sequence = [2500, 2500, 2500, 2500, 2500,
        1200, 1200, 1200, 1200, 1200, 1200,
        600, 600, 600, 600,
        300, 300, 300, 300];
      sequence.forEach((time) => {
        buttonIdleDirective.parameters.animations[0].sequence.push({
          'durationMs': time,
          'color': 'FFFFFF',
          'blend': true,
        });
        buttonIdleDirective.parameters.animations[0].sequence.push({
          'durationMs': (time * 3) / 4,
          'color': '000000',
          'blend': true,
        });
      });
      handlerInput.responseBuilder.addDirective(buttonIdleDirective);
    }
  },
  addRollAnimation: function(handlerInput, duration, playerNumber) {
    if (module.exports.supportButtons(handlerInput)) {
      // Flash the buttons white while the roll is being read
      // Then flash it green or red (based on win or loss)
      // Finally turn on or off based on whether they are the shooter
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const game = attributes[attributes.currentGame];
      let i;

      const buttonDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': [game.players[playerNumber].buttonId],
        'parameters': {
          'animations': [{
            'repeat': 1,
            'targetLights': ['1'],
            'sequence': [],
          }],
          'triggerEvent': 'none',
          'triggerEventTimeMs': 0,
        },
      };

      // First animation - fade to white
      buttonDirective.parameters.animations[0].sequence.push({
        'durationMs': 1000,
        'color': '000000',
        'blend': false,
      });
      buttonDirective.parameters.animations[0].sequence.push({
        'durationMs': duration,
        'color': 'FFFFFF',
        'blend': true,
      });

      // Did this player win or lose (or neither - in which case keep it white)
      let winColor;
      if (game.players[playerNumber].amountWon > 0) {
        winColor = '00FE10';
      } else if (game.players[playerNumber].amountWon < 0) {
        winColor = 'FF0000';
      } else {
        winColor = 'FFFFFF';
      }
      for (i = 0; i < 4; i++) {
        buttonDirective.parameters.animations[0].sequence.push({
          'durationMs': 600,
          'color': winColor,
          'blend': true,
        });
        buttonDirective.parameters.animations[0].sequence.push({
          'durationMs': 400,
          'color': '000000',
          'blend': true,
        });
      }

      // Finally, turn this on or off based on whether you are the shooter
      buttonDirective.parameters.animations[0].sequence.push({
        'durationMs': 60000,
        'color': (game.shooter === playerNumber) ? game.players[playerNumber].buttonColor : '000000',
        'blend': false,
      });
      handlerInput.responseBuilder.addDirective(buttonDirective);
    }
  },
/*
  addLaunchAnimation: function(handlerInput) {
    if (module.exports.supportButtons(handlerInput)) {
      // Flash the buttons white during roll call
      // This will intensify until it completes,
      // after the timeout it will auto-start the game
      const buttonIdleDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': [],
        'parameters': {
          'animations': [],
          'triggerEvent': 'none',
          'triggerEventTimeMs': 0,
        },
      };

      // Add to the animations array
      // This ends up finishing in about 30 seconds
      buttonIdleDirective.parameters.animations.push({
        'repeat': 4,
        'targetLights': ['1'],
        'sequence': [
          {
            'durationMs': 1500,
            'color': 'FFFFFF',
            'blend': true,
          },
          {
            'durationMs': 1125,
            'color': '000000',
            'blend': true,
          },
        ],
      });
      buttonIdleDirective.parameters.animations.push({
        'repeat': 7,
        'targetLights': ['1'],
        'sequence': [
          {
            'durationMs': 900,
            'color': 'FFFFFF',
            'blend': true,
          },
          {
            'durationMs': 675,
            'color': '000000',
            'blend': true,
          },
        ],
      });
      buttonIdleDirective.parameters.animations.push({
        'repeat': 4,
        'targetLights': ['1'],
        'sequence': [
          {
            'durationMs': 600,
            'color': 'FFFFFF',
            'blend': true,
          },
          {
            'durationMs': 450,
            'color': '000000',
            'blend': true,
          },
        ],
      });
      buttonIdleDirective.parameters.animations.push({
        'repeat': 4,
        'targetLights': ['1'],
        'sequence': [
          {
            'durationMs': 300,
            'color': 'FFFFFF',
            'blend': true,
          },
          {
            'durationMs': 225,
            'color': '000000',
            'blend': true,
          },
        ],
      });

      handlerInput.responseBuilder.addDirective(buttonIdleDirective);
    }
  },
  addRollAnimation: function(handlerInput, duration, playerNumber) {
    if (module.exports.supportButtons(handlerInput)) {
      // Flash the buttons white while the roll is being read
      // Then flash it green or red (based on win or loss)
      // Finally turn on or off based on whether they are the shooter
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const game = attributes[attributes.currentGame];

      const buttonDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': [game.players[playerNumber].buttonId],
        'parameters': {
          'animations': [],
          'triggerEvent': 'none',
          'triggerEventTimeMs': 0,
        },
      };

      // First animation - flashing white
      buttonDirective.parameters.animations.push({
        'repeat': Math.round(duration / 1000),
        'targetLights': ['1'],
        'sequence': [
          {
            'durationMs': 600,
            'color': 'FFFFFF',
            'blend': true,
          },
          {
            'durationMs': 400,
            'color': '000000',
            'blend': true,
          },
        ],
      });

      // Did this player win or lose (or neither - in which case keep it white)
      let winColor;
      if (game.players[playerNumber].amountWon > 0) {
        winColor = '00FE10';
      } else if (game.players[playerNumber].amountWon < 0) {
        winColor = 'FF0000';
      } else {
        winColor = 'FFFFFF';
      }
      buttonDirective.parameters.animations.push({
        'repeat': 3,
        'targetLights': ['1'],
        'sequence': [
          {
            'durationMs': 600,
            'color': winColor,
            'blend': true,
          },
          {
            'durationMs': 400,
            'color': '000000',
            'blend': true,
          },
        ],
      });

      // Finally, turn this on or off based on whether you are the shooter
      buttonDirective.parameters.animations.push({
        'repeat': 1,
        'targetLights': ['1'],
        'sequence': [
          {
            'durationMs': 60000,
            'color': (game.shooter === playerNumber) ?
              game.players[playerNumber].buttonColor : '000000',
            'blend': false,
          },
        ],
      });

      handlerInput.responseBuilder.addDirective(buttonDirective);
    }
  },
*/
};
