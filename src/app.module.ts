import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PersonsModule } from './persons/persons.module';
import { EventsModule } from './events/events.module';
import { DynastiesModule } from './dynasties/dynasties.module';
import { SearchModule } from './search/search.module';
import { GraphModule } from './graph/graph.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { TimelineModule } from './timeline/timeline.module';
import {
  Dynasty, Location, Person, Event, Relation, Source,
  PersonEvent, User, Favorite, History, ExportRecord,
} from './database/entities';

const entities = [
  Dynasty, Location, Person, Event, Relation, Source,
  PersonEvent, User, Favorite, History, ExportRecord,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const isSQLite = config.get('DB_TYPE') === 'sqlite';
        if (isSQLite) {
          return {
            type: 'sqlite',
            database: config.get('SQLITE_PATH') || './history-atlas.db',
            entities,
            synchronize: true,
            logging: true,
          };
        }
        return {
          type: 'postgres',
          url: config.get('DATABASE_URL'),
          host: config.get('DB_HOST') || 'localhost',
          port: parseInt(config.get('DB_PORT') || '5432', 10),
          username: config.get('DB_USER') || 'lsxt',
          password: config.get('DB_PASSWORD') || 'lsxt_secret',
          database: config.get('DB_NAME') || 'history_atlas',
          entities,
          synchronize: config.get('NODE_ENV') !== 'production',
          logging: config.get('DB_LOGGING') === 'true',
        };
      },
      inject: [ConfigService],
    }),
    PersonsModule,
    EventsModule,
    DynastiesModule,
    TimelineModule,
    SearchModule,
    // GraphModule,
    AuthModule,
    UsersModule,
    // AiModule,
    AdminModule,
  ],
})
export class AppModule {}
