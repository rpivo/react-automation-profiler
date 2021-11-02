export default {
  'leading-steps': [], // can be omitted
  'action-steps': {
    'Click First Button': ['click .first-button'],
    'Click Second Button Twice': [
      'click .second-button',
      'click .second-button',
    ],
    'Click Third Button Three Times': [
      'click .third-button',
      'click .third-button',
      'click .third-button',
    ],
  },
};
