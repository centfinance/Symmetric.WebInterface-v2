import Service from '../../balancer-subgraph-farms.service';
import farmQueryBuilder from './query';
import { Farm, QueryBuilder } from '../../types';

export default class Farms {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = farmQueryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<Farm[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.pools;
  }
}
