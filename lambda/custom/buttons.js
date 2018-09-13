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
    const colors = ['00FE10', 'FF0000', '0000FF', 'FFFF00'];
    return ((player >= 0) && (player < colors.length)) ? colors[player] : 'FFFFFF';
  },
  startInputHandler: function(handlerInput) {
    if (module.exports.supportButtons(handlerInput)) {
      // We'll allow them to press the button again
      const inputDirective = {
        'type': 'GameEngine.StartInputHandler',
        'timeout': 60000,
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
  },
  rollCallInputHandler: function(handlerInput) {
    if (module.exports.supportButtons(handlerInput)) {
      // We'll allow them to continue to press buttons until
      // the timeout is reached and which point the game starts
      const inputDirective = {
        'type': 'GameEngine.StartInputHandler',
        'timeout': 30000,
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
              'color': 'FFFF00',
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
  colorButton: function(handlerInput, buttonId, buttonColor) {
    if (module.exports.supportButtons(handlerInput)) {
      let i;
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

      // Pulse a few times white
      for (i = 0; i < 4; i++) {
        buttonIdleDirective.parameters.animations[0].sequence.push({
          'durationMs': 400,
          'color': 'FFFFFF',
          'blend': true,
        });
        buttonIdleDirective.parameters.animations[0].sequence.push({
          'durationMs': 300,
          'color': '000000',
          'blend': true,
        });
      }

      // Then solid white (long is an extra four seconds)
      buttonIdleDirective.parameters.animations[0].sequence.push({
        'durationMs': 4000,
        'color': 'FFFFFF',
        'blend': false,
      });

      // Pulse based on whether they won or lost
      for (i = 0; i < 4; i++) {
        buttonIdleDirective.parameters.animations[0].sequence.push({
          'durationMs': 400,
          'color': buttonColor,
          'blend': true,
        });
        buttonIdleDirective.parameters.animations[0].sequence.push({
          'durationMs': 300,
          'color': '000000',
          'blend': true,
        });
      }

      // And then back to white
      buttonIdleDirective.parameters.animations[0].sequence.push({
        'durationMs': 60000,
        'color': 'FFFFFF',
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
      // This ends up finishing in about 30 seconds
      const sequence = [1500, 1500, 1500, 1500,
        900, 900, 900, 900, 900, 900, 900,
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
};
