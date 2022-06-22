import gql from 'graphql-tag';

export const tokenPriceQuery = gql`
  query tokenPriceQuery($id: String!) {
    tokenPrices(first: 1, where: { id: $id }) {
      id
      symbol
      name
      decimals
      price
    }
  }
`;
