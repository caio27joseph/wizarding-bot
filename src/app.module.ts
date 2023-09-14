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
import { TrainModule } from './evolution/train/train.module';
import { GrimoireModule } from './grimoire/grimoire.module';
import { SpacesModule } from './spaces/spaces.module';
import { ItemsModule } from './items/items.module';
import { ActionsModule } from './actions/actions.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EvolutionModule } from './evolution/evolution.module';
import { EconomyModule } from './economy/economy.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/generated/schema.gql'),
    }),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot(),
    DiscordModule,
    CoreModule,
    DatabaseModule,
    HouseCupModule,
    SpellModule,
    SeederModule,
    PlayerSystemModule,
    RollModule,
    GrimoireModule,
    ItemsModule,
    SpacesModule,
    ActionsModule,
    EvolutionModule,
    EconomyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
