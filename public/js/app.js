/* global AccCore */
var x = window.location.search.substr(1)
let otCore;
console.log(x);
if(x=="password=csi"){
  credentials1={
    "apiKey": "46691642",
    "sessionId": "2_MX40NjY5MTY0Mn5-MTU4NzUwNTAzNzk5Mn5MMnBDZGpyWGgwMVovVmlubVA0c0FZVkZ-fg",
    "token": "T1==cGFydG5lcl9pZD00NjY5MTY0MiZzaWc9Njk0MDVmNWM0MDFjYmNiNjc3NzAyNmZmOWJmN2RhNWFjNGYwOWU4YzpzZXNzaW9uX2lkPTJfTVg0ME5qWTVNVFkwTW41LU1UVTROelV3TlRBek56azVNbjVNTW5CRFpHcHlXR2d3TVZvdlZtbHViVkEwYzBGWlZrWi1mZyZjcmVhdGVfdGltZT0xNTg3NTA1MDYwJm5vbmNlPTAuNjcxNDUwMzM3NzYyNTgmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTU5MDA5NzA1OSZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=="
  }}
  else{
    credentials1={
      "apiKey": "46691642",
    "sessionId": "2_MX40NjY5MTY0Mn5-MTU4NzUwNTAzNzk5Mn5MMnBDZGpyWGgwMVovVmlubVA0c0FZVkZ-fg",
    "token": "T1==cGFydG5lcl9pZD00NjY5MTY0MiZzaWc9Njk0MDVmNWM0MDFjYmNiNjc3NzAyNmZmOWJmN2RhNWFjNGYwOWU4YzpzZXNzaW9uX2lkPTJfTVg0ME5qWTVNVFkwTW41LU1UVTROelV3TlRBek56azVNbjVNTW5CRFpHcHlXR2d3TVZvdlZtbHViVkEwYzBGWlZrWi1mZyZjcmVhdGVfdGltZT0xNTg3NTA1MDYwJm5vbmNlPTAuNjcxNDUwMzM3NzYyNTgmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTU5MDA5NzA1OSZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=="
  }
  }
console.log(credentials1);
var options = {
  // A container can either be a query selector or an HTMLElement
  // eslint-disable-next-line no-unused-vars
  
  credentials: credentials1,
  streamContainers: function streamContainers(pubSub, type, data) {
    return {
      publisher: {
        camera: '#cameraPublisherContainer',
        screen: '#screenPublisherContainer',
      },
      subscriber: {
        camera: '#cameraSubscriberContainer',
        screen: '#screenSubscriberContainer',
      },
    }[pubSub][type];
  },
  controlsContainer: '#controls',
  packages: ['textChat', 'screenSharing', 'annotation', 'archiving'],
  communication: {
    callProperties: null, // Using default
  },
  textChat: {
    name: ['User1', 'User2', 'User3', 'User4'][Math.random() * 4 | 0], // eslint-disable-line no-bitwise
    waitingMessage: 'Messages will be delivered when other users arrive',
    container: '#chat',
  },
  screenSharing: {
    extensionID: 'gchhgeiiommhhbhmbkjkebbbakimolai',
    annotation: true,
    externalWindow: false,
    dev: true,
    screenProperties: null, // Using default
  },
  annotation: {

  },
  archiving: {
    startURL: 'https://example.com/startArchive',
    stopURL: 'https://example.com/stopArchive',
  },
};

/** Application Logic */
const app = function() {
  const state = {
    connected: false,
    active: false,
    publishers: null,
    subscribers: null,
    meta: null,
    localAudioEnabled: true,
    localVideoEnabled: true,
  };

  /**
   * Update the size and position of video containers based on the number of
   * publishers and subscribers specified in the meta property returned by otCore.
   */
  const updateVideoContainers = () => {
    const { meta } = state;
    const sharingScreen = meta ? !!meta.publisher.screen : false;
    const viewingSharedScreen = meta ? meta.subscriber.screen : false;
    const activeCameraSubscribers = meta ? meta.subscriber.camera : 0;

    const videoContainerClass = `App-video-container ${(sharingScreen || viewingSharedScreen) ? 'center' : ''}`;
    document.getElementById('appVideoContainer').setAttribute('class', videoContainerClass);

    const cameraPublisherClass =
      `video-container ${!!activeCameraSubscribers || sharingScreen ? 'small' : ''} ${!!activeCameraSubscribers || sharingScreen ? 'small' : ''} ${sharingScreen || viewingSharedScreen ? 'left' : ''}`;
    document.getElementById('cameraPublisherContainer').setAttribute('class', cameraPublisherClass);

    const screenPublisherClass = `video-container ${!sharingScreen ? 'hidden' : ''}`;
    document.getElementById('screenPublisherContainer').setAttribute('class', screenPublisherClass);

    const cameraSubscriberClass =
      `video-container ${!activeCameraSubscribers ? 'hidden' : ''} active-${activeCameraSubscribers} ${viewingSharedScreen || sharingScreen ? 'small' : ''}`;
    document.getElementById('cameraSubscriberContainer').setAttribute('class', cameraSubscriberClass);

    const screenSubscriberClass = `video-container ${!viewingSharedScreen ? 'hidden' : ''}`;
    document.getElementById('screenSubscriberContainer').setAttribute('class', screenSubscriberClass);
  };


  /**
   * Update the UI
   * @param {String} update - 'connected', 'active', or 'meta'
   */
  const updateUI = (update) => {
    const { connected, active } = state;

    switch (update) {
      case 'connected':
        if (connected) {
          document.getElementById('connecting-mask').classList.add('hidden');
          document.getElementById('start-mask').classList.remove('hidden');
        }
        break;
      case 'active':
        if (active) {
          document.getElementById('cameraPublisherContainer').classList.remove('hidden');
          document.getElementById('start-mask').classList.add('hidden');
          document.getElementById('controls').classList.remove('hidden');
        }
        break;
      case 'meta':
        updateVideoContainers();
        break;
      default:
        console.log('nothing to do, nowhere to go');
    }
  };

  /**
   * Update the state and UI
   */
  const updateState = function(updates) {
    Object.assign(state, updates);
    Object.keys(updates).forEach(update => updateUI(update));
  };

  /**
   * Start publishing video/audio and subscribe to streams
   */
  const startCall = function() {
    otCore.startCall()
      .then(function({ publishers, subscribers, meta }) {
        updateState({ publishers, subscribers, meta, active: true });
      }).catch(function(error) { console.log(error); });
  };

  /**
   * Toggle publishing local audio
   */
  const toggleLocalAudio = function() {
    const enabled = state.localAudioEnabled;
    otCore.toggleLocalAudio(!enabled);
    updateState({ localAudioEnabled: !enabled });
    const action = enabled ? 'add' : 'remove';
    document.getElementById('toggleLocalAudio').classList[action]('muted');
  };

  /**
   * Toggle publishing local video
   */
  const toggleLocalVideo = function() {
    const enabled = state.localVideoEnabled;
    otCore.toggleLocalVideo(!enabled);
    updateState({ localVideoEnabled: !enabled });
    const action = enabled ? 'add' : 'remove';
    document.getElementById('toggleLocalVideo').classList[action]('muted');
  };

  /**
   * Subscribe to otCore and UI events
   */
  const createEventListeners = function() {
    const events = [
      'subscribeToCamera',
      'unsubscribeFromCamera',
      'subscribeToScreen',
      'unsubscribeFromScreen',
      'startScreenShare',
      'endScreenShare',
    ];
    events.forEach(event => otCore.on(event, ({ publishers, subscribers, meta }) => {
      updateState({ publishers, subscribers, meta });
    }));

    document.getElementById('start').addEventListener('click', startCall);
    document.getElementById('toggleLocalAudio').addEventListener('click', toggleLocalAudio);
    document.getElementById('toggleLocalVideo').addEventListener('click', toggleLocalVideo);
  };

  /**
   * Initialize otCore, connect to the session, and listen to events
   */
  const init = function() {
    otCore = new AccCore(options);
    otCore.connect().then(function() { updateState({ connected: true }); });
    createEventListeners();
  };

  init();
};

document.addEventListener('DOMContentLoaded', app);
