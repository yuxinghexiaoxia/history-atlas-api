import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class GraphService implements OnModuleInit, OnModuleDestroy {
  private driver: Driver;

  onModuleInit() {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'lsxt_secret';
    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    } catch (e) {
      console.warn(
        'Neo4j connection failed, graph service disabled:',
        e.message,
      );
    }
  }

  onModuleDestroy() {
    if (this.driver) this.driver.close();
  }

  private session(): Session | null {
    if (!this.driver) return null;
    return this.driver.session();
  }

  async getGraph(centerId: string, depth = 1) {
    const session = this.session();
    if (!session) return { nodes: [], links: [] };
    const result = await session.run(
      `MATCH path = (center {id: $centerId})-[:RELATES*1..${depth}]-(n)
       RETURN center, relationships(path) as rels, nodes(path) as nodes LIMIT 200`,
      { centerId },
    );
    await session.close();

    const nodeMap = new Map<string, any>();
    const links: any[] = [];
    result.records.forEach((record) => {
      const ns = record.get('nodes');
      const rs = record.get('rels');
      ns.forEach((n: any) => {
        const id = n.properties.id;
        if (!nodeMap.has(id))
          nodeMap.set(id, { id, ...n.properties, labels: n.labels });
      });
      rs.forEach((r: any) => {
        links.push({
          source: r.startNodeElementId ? undefined : r.properties.sourceId,
          target: r.endNodeElementId ? undefined : r.properties.targetId,
          type: r.properties.relationType,
          label: r.properties.label,
        });
      });
    });
    return { nodes: Array.from(nodeMap.values()), links };
  }

  async syncRelation(
    sourceId: string,
    targetId: string,
    relationType: string,
    label?: string,
    description?: string,
  ) {
    const session = this.session();
    if (!session) return;
    await session.run(
      `MERGE (a:Entity {id: $sourceId})
       MERGE (b:Entity {id: $targetId})
       MERGE (a)-[r:RELATES {relationType: $relationType}]->(b)
       SET r.label = $label, r.description = $description`,
      {
        sourceId,
        targetId,
        relationType,
        label: label || '',
        description: description || '',
      },
    );
    await session.close();
  }
}
