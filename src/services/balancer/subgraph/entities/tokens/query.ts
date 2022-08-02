import { merge } from 'lodash';

const defaultArgs = {
  first: 100,
  where: {
    // balance_gt: 0 // TODO:
  }
};

const defaultAttrs = {
  id: true,
  symbol: true,
  latestPrice: {
    price: true
  }
};

export default (args = {}, attrs = {}) => ({
  tokens: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs)
  }
});
