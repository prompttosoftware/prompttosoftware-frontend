// __mocks__/@xenova/transformers.js
// This file provides a manual mock for the @xenova/transformers module,
// setting up basic jest.fn() mocks to be configured by individual tests.

const mockPipeline = jest.fn();

module.exports = {
  pipeline: mockPipeline,
  AutoModelForSequenceClassification: {
    from_pretrained: jest.fn(),
  },
  AutoTokenizer: {
    from_pretrained: jest.fn(),
  },
};
