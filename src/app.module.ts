import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { HouseCupModule } from './house-cup/house-cup.module';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { SpellModule } from './spell/spell.module';
import { SeederModule } from './seeder/seeder.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PlayerSystemModule } from './player-system/player-system.module';
import { RollModule } from './roll/roll.module';
import { TrainModule } from './train/train.module';
import { GrimoireModule } from './grimoire/grimoire.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/generated/schema.gql'),
    }),
    ConfigModule.forRoot(),
    DiscordModule,
    CoreModule,
    DatabaseModule,
    HouseCupModule,
    SpellModule,
    SeederModule,
    PlayerSystemModule,
    RollModule,
    TrainModule,
    GrimoireModule,
    ItemsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
