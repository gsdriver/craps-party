'use strict';

const Alexa = require('ask-sdk');
const CanFulfill = require('./intents/CanFulfill');
const Launch = require('./intents/Launch');
const Remove = require('./intents/Remove');
const Roll = require('./intents/Roll');
const EndRollCall = require('./intents/EndRollCall');
const Bet = require('./intents/Bet');
const BetPrompt = require('./intents/BetPrompt');
const Help = require('./intents/Help');
const Exit = require('./intents/Exit');
const SessionEnd = require('./intents/SessionEnd');
const AddPlayer = require('./intents/AddPlayer');
const Repeat = require('./intents/Repeat');
const Unhandled = require('./intents/Unhandled');
const utils = require('./utils');
const buttons = require('./buttons');

const requestInterceptor = {
  process(handlerInput) {
    return new Promise((resolve, reject) => {
      const attributesManager = handlerInput.attributesManager;
      const sessionAttributes = attributesManager.getSessionAttributes();
      const event = handlerInput.requestEnvelope;

      if (Object.keys(sessionAttributes).length === 0) {
        // No session attributes - so get the persistent ones
        attributesManager.getPersistentAttributes()
          .then((attributes) => {
            // If no persistent attributes, it's a new player
            attributes.temp = {};
            attributes.sessions = (attributes.sessions + 1) || 1;
            attributes.temp.newSession = true;
            attributes.playerLocale = event.request.locale;

            if (!attributes.currentGame) {
              attributes.currentGame = 'standard';
              attributes.prompts = {};
              attributes.standard = {
                minBet: 5,
                maxOdds: 10,
                startingBankroll: 1000,
                players: [],
              };
            } else {
              // Reset the players
              attributes.standard.players = [];
              attributes.standard.dice = undefined;
              attributes.standard.point = undefined;
              attributes.standard.shooter = undefined;
            }

            // Temporary
            attributes.prompts = {};

            // Since there were no session attributes, this is the first
            // round of the session - set the temp attributes
            attributesManager.setSessionAttributes(attributes);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve();
      }
    });
  },
};

const saveResponseInterceptor = {
  process(handlerInput) {
    return new Promise((resolve, reject) => {
      const response = handlerInput.responseBuilder.getResponse();
      const attributes = handlerInput.attributesManager.getSessionAttributes();

      if (response) {
        utils.drawTable(handlerInput);
        if (attributes.temp && attributes.temp.newSession) {
          // Set up the buttons to all flash, welcoming the user to press a button
          buttons.addLaunchAnimation(handlerInput);
          buttons.buildButtonDownAnimationDirective(handlerInput, []);
          buttons.rollCallInputHandler(handlerInput);
          attributes.temp.newSession = undefined;
        }
        if (response.shouldEndSession) {
          // We are meant to end the session
          SessionEnd.handle(handlerInput);
        } else {
          // Save the response and reprompt for repeat
          if (response.outputSpeech && response.outputSpeech.ssml) {
            attributes.temp.lastResponse = response.outputSpeech.ssml;
          }
          if (response.reprompt && response.reprompt.outputSpeech
            && response.reprompt.outputSpeech.ssml) {
            attributes.temp.lastReprompt = response.reprompt.outputSpeech.ssml;
          }
        }
      }
      if (!process.env.NOLOG) {
        console.log(JSON.stringify(response));
      }
      resolve();
    });
  },
};

const ErrorHandler = {
  canHandle(handlerInput, error) {
    return error.name.startsWith('AskSdk');
  },
  handle(handlerInput, error) {
    return handlerInput.responseBuilder
      .speak('An error was encountered while handling your request. Try again later')
      .getResponse();
  },
};

if (process.env.DASHBOTKEY) {
  const dashbot = require('dashbot')(process.env.DASHBOTKEY).alexa;
  exports.handler = dashbot.handler(runGame);
} else {
  exports.handler = runGame;
}

function runGame(event, context, callback) {
  const skillBuilder = Alexa.SkillBuilders.standard();

  if (!process.env.NOLOG) {
    console.log(JSON.stringify(event));
  }

  // If this is a CanFulfill, handle this separately
  if (event.request && (event.request.type == 'CanFulfillIntentRequest')) {
    callback(null, CanFulfill.check(event));
    return;
  }

  const skillFunction = skillBuilder.addRequestHandlers(
      Launch,
      AddPlayer,
      Exit,
      Help,
      Bet,
      Remove,
      BetPrompt,
      Roll,
      EndRollCall,
      SessionEnd,
      Repeat,
      Unhandled
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(requestInterceptor)
    .addResponseInterceptors(saveResponseInterceptor)
    .withTableName('CrapsParty')
    .withAutoCreateTable(true)
    .withSkillId('amzn1.ask.skill.8b5f337f-0c1f-483a-b282-843c76487e7e')
    .lambda();
  skillFunction(event, context, (err, response) => {
    callback(err, response);
  });
}
