import Service from '../../balancer-subgraph.service';
import tokenQueryBuilder from './query';
import { TokenPrice, QueryBuilder} from '../../types';

export default class Tokens {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = tokenQueryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<TokenPrice[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.tokens;
  }
}
