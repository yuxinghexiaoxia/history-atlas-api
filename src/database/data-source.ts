import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'lsxt',
  password: process.env.DB_PASSWORD || 'lsxt_secret',
  database: process.env.DB_NAME || 'history_atlas',
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  logging: process.env.DB_LOGGING === 'true',
});
