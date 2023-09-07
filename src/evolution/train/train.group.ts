import { Injectable } from '@nestjs/common';
import { Group } from '~/discord/decorators/group.decorator';
import { CommandInteraction } from 'discord.js';
import { Player } from '~/core/player/entities/player.entity';
import { RollService } from '~/roll/roll.service';
import { MagicSchoolDisplayEnum } from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { TrainGroupOption } from './entities/train.entity';
import { ILike } from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgGuild,
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { groupBy, sumBy } from 'lodash';
import { PaginationHelper } from '~/discord/helpers/page-helper';
import { SpellService } from '~/spell/spell.service';
import { DiscordSimpleError } from '~/discord/exceptions';
import { TrainSpellService } from './train-spell.service';
import { TrainSpellMenu } from './train-spell.menu';
import { TrainService } from './train.service';
import { SpellActionContext } from '~/spell/spell.menu.group';
import { GrimoireService } from '~/grimoire/grimoire.service';

export enum SpellTrainAction {
  SELECT_GROUP = 'spell-train-group-select',
  SELECT_ROLL = 'spell-train-tests-select',
  CANCEL = 'spell-train-cancel',
  SUBMIT = 'spell-train-submit',
  BONUS_ROLL = 'spell-train-bonus-roll',
  AUTO_SUCCESS = 'spell-train-auto-success',
  DOUBLE_TRAIN = 'spell-train-double-train',
}

export interface SpellTrainData {
  category?: MagicSchoolDisplayEnum;
  spellId?: string;
  group?: TrainGroupOption;
  playerId?: string;
  autoSuccess?: number;
  bonusRoll?: number;
  doubleTrain?: boolean;
}

@Group({
  name: 'maestria',
  description: 'Veja as maestrias adquiridas',
})
@Injectable()
export class MaestryGroup {
  constructor(
    private readonly trainService: TrainService,
    private readonly trainSpellService: TrainSpellService,
    private readonly spellService: SpellService,
  ) {}

  @Command({
    name: 'feiticos',
    description: 'Verifica todos os status de maestria que você possui',
  })
  async spellsTrains(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
  ) {
    const trains = await this.trainSpellService.playerTrains(player.id);
    const sortedSpells = this.trainSpellService.getSortedSpellsByXP(trains);

    const helper = new PaginationHelper({
      items: sortedSpells,
      formatter: async ([spellId, totalXP]) => {
        return await this.trainSpellService.formatSpellForDisplay(
          spellId,
          totalXP,
          trains,
        );
      },
      header: '\n**Feitiços Por Maestria:**\n',
    });

    await helper.reply(interaction);
  }
}

@Group({ name: 'treinar', description: 'Treine seus feitiços' })
@Injectable()
export class TrainGroup {
  constructor(
    private readonly spellService: SpellService,
    private readonly trainSpellMenu: TrainSpellMenu,
    private readonly grimoireService: GrimoireService,
  ) {}

  @Command({
    name: 'default',
    description: 'Treine sua maestria',
  })
  async train(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgPlayer() player: Player,
    @ArgString({
      name: 'Feitiço',
      description: 'Nome do feitiço a ser treinado',
      required: false,
    })
    spellName?: string,
  ) {
    await interaction.deferReply({ ephemeral: true });
    if (!spellName) {
      throw new DiscordSimpleError('Você precisa informar o que vai treinar');
    }
    const spell = await this.spellService.findOneOrFail({
      where: {
        guildId: guild.id,
        name: ILike(spellName),
      },
    });
    if (!spell) {
      throw new DiscordSimpleError('Feitiço não encontrado');
    }

    const grimoire = await this.grimoireService.getOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
      },
    );

    const context = await this.trainSpellMenu.buildUpContext({
      interaction,
      guild,
      player,
      spell,
      grimoire,
    } as SpellActionContext);

    return await this.trainSpellMenu.train(context);
  }
}
