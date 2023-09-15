import { Injectable } from '@nestjs/common';
import { Group } from '~/discord/decorators/group.decorator';
import {
  AttachmentBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  EmbedField,
  InteractionReplyOptions,
} from 'discord.js';
import { Player } from '~/core/player/entities/player.entity';
import { RollService } from '~/roll/roll.service';
import {
  MagicSchoolDisplayEnum,
  MagicSchoolPtBr,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { Train, TrainGroupOption } from './entities/train.entity';
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
import { PaginationHelper } from '~/discord/helpers/page-helper';
import { SpellService } from '~/spell/spell.service';
import { DiscordSimpleError } from '~/discord/exceptions';
import {
  SpellTrainEvent,
  SpellTrainOptions,
  TrainSpellService,
} from './train-spell.service';
import { TrainService } from './train.service';
import { SpellActionContext } from '~/spell/spell.menu.group';
import { GrimoireService } from '~/grimoire/grimoire.service';
import { MessageCollectorHelper } from '~/discord/helpers/message-collector-helper';
import { RollsD10 } from '~/roll/entities/roll.entity';
import { Spell, maestryNumToName } from '~/spell/entities/spell.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ButtonConfig, FormHelper } from '~/discord/helpers/form-helper';
import { Grimoire } from '~/grimoire/entities/grimoire.entity';

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
  constructor(private readonly trainSpellService: TrainSpellService) {}

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
    private readonly grimoireService: GrimoireService,
    private readonly trainService: TrainService,
    private readonly trainSpellService: TrainSpellService,
    private readonly rollService: RollService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async beautify(spell: Spell, trains: Train[]) {
    const progress = await this.trainSpellService.progressData({
      trains,
      spell: spell,
    });
    const embed = new EmbedBuilder().setTitle(
      `:magic_wand: Maestria de ${spell.name}`,
    );

    embed.setDescription(
      `***Maestria ${maestryNumToName[progress.currentLevel]}***: ` +
        spell.maestry.find((m) => m.level === progress.currentLevel)
          .description,
    );
    embed.setFields(
      {
        name: ':student: Progresso',
        value: `Treinos Totais: ${progress.totalTrains}\nXP Total: ${progress.totalXp}`,
        inline: true,
      },
      {
        name: ':dna: Evolução',
        value: `XP ${progress.xpTowardsNextLevel}/${progress.necessaryXP}`,
        inline: true,
      },
    );
    const buffer = this.trainSpellService.createSpellMasteryImage(
      progress.xpTowardsNextLevel,
      progress.necessaryXP,
    );
    const attachment = new AttachmentBuilder(buffer, {
      name: 'spell-mastery.png',
    });

    embed.setImage('attachment://spell-mastery.png');
    return {
      embeds: [embed],
      files: [attachment],
    };
  }

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
    @ArgInteger({
      name: 'Bônus',
      description: 'Bônus de treino',
      required: false,
    })
    bonus?: number,
    @ArgInteger({
      name: 'Sucessos Automáticos',
      description: 'Duração de treino',
      required: false,
    })
    autoSuccess?: number,
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

    const todayTrains = await this.trainSpellService.getTodayTrains(player.id);

    return await this.doTrain({
      interaction,
      guild,
      player,
      grimoire,
      todayTrains,
      options: {
        autoSuccess,
        bonus,
        spell,
      },
    });
  }

  async doTrain({
    todayTrains,
    grimoire,
    interaction,
    player,
    guild,
    options,
  }: {
    todayTrains: Train[];
    grimoire: Grimoire;
    interaction: CommandInteraction;
    player: Player;
    guild: Guild;
    options: SpellTrainOptions;
  }) {
    const { spell } = options;
    await this.trainSpellService.validate({
      spell,
      todayTrains,
      player,
    });

    if (!grimoire.spells.some((s) => s.id === spell.id)) {
      return await interaction.followUp(
        'Você não conhece esse feitiço, use /grimorio aprender',
      );
    }

    const canDoubleTrain = this.trainSpellService.canDoubleTrain({
      todayTrains,
      spell,
    });
    const buttons: ButtonConfig<SpellTrainOptions>[] = [
      {
        label: 'Cancelar',
        style: ButtonStyle.Danger,
        handler: async (i, props) => {
          throw new DiscordSimpleError('Treino cancelado');
        },
      },
      {
        label: 'Treinar',
        style: ButtonStyle.Primary,
        handler: async (i, props) => {
          await this.startTrain({
            guild,
            interaction,
            player,
            options: {
              ...options,
              ...props,
              double: false,
            },
          });
        },
      },
    ];

    if (canDoubleTrain) {
      buttons.push({
        label: 'Treinar x2',
        style: ButtonStyle.Secondary,
        handler: async (i, props) => {
          await this.startTrain({
            guild,
            interaction,
            player,
            options: {
              ...options,
              ...props,
              double: true,
            },
          });
        },
      });
    }
    await new FormHelper<SpellTrainOptions>(interaction, {
      label: `Treinar ${spell.name} ${
        spell.category.length === 1 ? `\n> Controle + ${spell.category[0]}` : ''
      }`,
      buttons,
      fields: [
        {
          placeholder: 'Estilo de Treino (Padrão: Treino Sozinho)',
          propKey: 'group',
          choices: [
            {
              label: 'Treino Sozinho',
              value: TrainGroupOption.SOLO,
            },
            {
              label: 'Treino em Dupla',
              value: TrainGroupOption.DUO,
            },
            {
              label: 'Treino em Trio',
              value: TrainGroupOption.TRIO,
            },
            {
              label: 'Treino em Grupo',
              value: TrainGroupOption.GROUP,
            },
            {
              label: 'Treino com Tutor (Monitor / Especialista)',
              value: TrainGroupOption.TUTOR,
            },
            {
              label: 'Treino com Professor',
              value: TrainGroupOption.PROFESSOR,
            },
          ],
          defaultValue: TrainGroupOption.SOLO,
        },
        {
          placeholder: `Rolagens Disponíveis (Padrão: Controle + ${spell.category[0]})})`,
          propKey: 'magicSchool',
          choices: spell.category.map((c) => ({
            label: `Controle + ${c}`,
            value: c,
          })),
          defaultValue: spell.category[0],
          disabled: spell.category.length === 1,
        },
      ],
    }).init();
  }

  async startTrain({
    interaction,
    player,
    guild,
    options,
  }: {
    interaction: CommandInteraction;
    player: Player;
    guild: Guild;
    options: SpellTrainOptions;
  }) {
    const { group, magicSchool, bonus, autoSuccess, double, spell } = options;
    const embed = new EmbedBuilder();
    embed.setTitle(`Treino de ${spell.name}`);
    const fields: EmbedField[] = [];
    if (bonus) {
      fields.push({
        name: 'Bônus de Treino',
        value: bonus.toString(),
        inline: true,
      });
    }
    if (autoSuccess) {
      fields.push({
        name: 'Sucessos Automáticos',
        value: autoSuccess.toString(),
        inline: true,
      });
    }
    fields.push(
      {
        name: 'Estilo de Treino',
        value: group,
        inline: true,
      },
      {
        name: 'Rolagem',
        value: `Controle + ${magicSchool}`,
        inline: true,
      },
      {
        name: 'Treino Duplo?',
        value: double ? 'Sim' : 'Não',
        inline: true,
      },
    );
    embed.setFields(fields);
    const message = await new MessageCollectorHelper(interaction).message({
      content: 'Envie a ação de treino completar',
      embeds: [embed],
      ephemeral: true,
    });

    const rolls: RollsD10[] = [];
    const roll = await this.rollService.roll10(interaction, player, {
      magicSchool: MagicSchoolPtBr[magicSchool],
      extras: 'control',
      autoSuccess,
      bonus,
      message: spell.name,
    });
    rolls.push(roll);
    if (double) {
      const roll = await this.rollService.roll10(interaction, player, {
        magicSchool: MagicSchoolPtBr[magicSchool],
        extras: 'control',
        autoSuccess,
        bonus,
        message: spell.name,
      });
      rolls.push(roll);
    }
    // total should be the total sum of rolls array
    const train = await this.trainService.create({
      success: rolls.reduce((acc, curr) => acc + curr.total, 0),
      channelId: interaction.channelId,
      messageId: message.id,
      spell: spell,
      spellId: spell.id,
      player: player,
      playerId: player.id,
      group,
      double,
    });

    await message.reply({
      content: train.toShortText(),
      embeds: rolls.map((r) => r.toEmbed()),
    });

    if (interaction.isRepliable()) {
      const trains = await this.trainService.findAll({
        where: {
          spellId: spell.id,
          playerId: player.id,
        },
      });
      const progress = await this.beautify(spell, trains);
      (progress as InteractionReplyOptions).ephemeral = true;
      await interaction.followUp(progress);
    }

    this.eventEmitter.emit('spell-train', {
      train,
      player,
      interaction,
      options,
    } as SpellTrainEvent);

    if (!guild.trainLogChannel) {
      return;
    }

    await guild.trainLogChannel.send({
      content:
        `<@${player.discordId}> realizou um treino de ${spell.name}, Ação: ` +
        `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` +
        `\nID: ${train.id}`,
      embeds: [train.toEmbed()],
    });
  }
}
