import { merge } from 'lodash';

const defaultArgs = {
  first: 100,
  where: {
    // balance_gt: 0 // TODO:
  }
};

const defaultAttrs = {
  id: true,
  pair: true,
  rewarder: {
    id: true,
    rewardToken: true,
    rewardPerSecond: true,
    totalAllocPoint: true
  },
  rewarderAllocPoint: true,
  allocPoint: true,
  lastRewardTime: true,
  accSymmPerShare: true,
  slpBalance: true,
  userCount: true,
  symmChef: {
    id: true,
    symm: true,
    symmPerSecond: true,
    totalAllocPoint: true
  }
};

export default (args = {}, attrs = {}) => ({
  pools: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs)
  }
});
