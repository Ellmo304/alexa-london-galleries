const Alexa = require('alexa-sdk');

const OpearloAnalytics = require('opearlo-analytics');

const APP_ID = 'amzn1.ask.skill.6d2e6597-af59-4345-a295-dcd5c9388d04';
const opearloApiKey = 'RrTGUvJLyz3w5yR8zaC5p5V7Q83VCnfv6M8fnrCE';
const opearloUserId = 'kJnUOYznWOZmmLEv4aUesaMrOg63';
const voiceAppName = 'london-galleries';

const welcomeMessage = 'Welcome to London Galleries! Find out what exhibitions are currently on at art galleries in London. Ask, whats on at, and then the name of the gallery.';
const prompt = 'Would you like to ask about another gallery?';
const reprompt = 'Ask, whats on at, and then the name of the gallery?';
const helpMessage = 'I will help you find out what exhibitions are currently on at art galleries in London. Ask, whats on at, and then the name of the gallery.';
const goodbyeMessage = 'Thanks for using London Galleries. See you again soon.';

const handlers = {
  'LaunchRequest': function () {
    this.emit(':ask', welcomeMessage, reprompt);
  },
  'WhatsOnIntent': function () {
    if (this.event.request.intent.slots.gallery.value) {
      const gallery = this.event.request.intent.slots.gallery.value;
      const voiceContentID = gallery.replace(/\s+/g, '-').toLowerCase();
      OpearloAnalytics.getVoiceContent(opearloUserId, voiceAppName, opearloApiKey, voiceContentID, (result) => {
        this.emit(':ask', `${result} ${prompt}`, reprompt);
      });
    }
    else {
      this.emit(':ask', 'Sorry, I dont know about that gallery yet. Would you like to ask about a different one?', reprompt);
    }
  },
  'AMAZON.StopIntent': function () {
    OpearloAnalytics.recordAnalytics(this.event.session.user.userId, opearloApiKey, (result) => {
      this.emit(':tell', goodbyeMessage);
    });
  },
  'AMAZON.CancelIntent': function () {
    OpearloAnalytics.recordAnalytics(this.event.session.user.userId, opearloApiKey, (result) => {
      this.emit(':tell', goodbyeMessage);
    });
  },
  'AMAZON.HelpIntent': function () {
    this.emit(':ask', helpMessage, reprompt);
  },
  'AMAZON.YesIntent': function () {
    this.emit(':ask', 'Which gallery?', reprompt);
  },
  'AMAZON.NoIntent': function () {
    this.emit('AMAZON.StopIntent');
  },
  'SessionEndedRequest': function () {
    // Use this function to clear up and save any data needed between sessions
    this.emit('AMAZON.StopIntent');
  },
  'Unhandled': function () {
    this.emit('AMAZON.HelpIntent');
  },
};

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  if (event.session.new) {
    OpearloAnalytics.initializeAnalytics(opearloUserId, voiceAppName, event.session);
  }
  if (event.request.type === 'IntentRequest') {
    OpearloAnalytics.registerVoiceEvent(event.session.user.userId, 'IntentRequest', event.request.intent);
  }
  alexa.execute();
};
