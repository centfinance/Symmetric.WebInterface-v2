import { JsonRpcProvider } from '@ethersproject/providers';
import ENS from '@ensdomains/ensjs';
import celo from '../../constants/celo.json';

export const getName = async address => {
  /* eslint-disable */
    const nomProvider = new JsonRpcProvider(celo.rpcUrl);
    const ens = new ENS({ provider: nomProvider, ensAddress: celo.ENSRegistry });
    let nomDomain = null;
    ({ name:nomDomain } = await ens.getName(address));
    return nomDomain? nomDomain + ".nom" : '';
};