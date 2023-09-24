import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { Guild } from '~/core/guild/guild.entity';
import { Player } from '~/core/player/entities/player.entity';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgGuild,
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { LearnService } from '~/evolution/learn/learn.service';
import { SpellService } from './spell.service';
import { Spell, SpellDifficultyEnum } from './entities/spell.entity';
import { GrimoireMenu } from '~/grimoire/grimoire.menu';
import {
  MagicSchoolKeys,
  MagicSchoolPtBr,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { ILike } from 'typeorm';
import { DiscordSimpleError } from '~/discord/exceptions';
import { TrainService } from '~/evolution/train/train.service';
import { TrainGroupOption } from '~/evolution/train/entities/train.entity';
import { MaestryGroup, TrainGroup } from '~/evolution/train/train.group';
import { PaginationHelper } from '~/discord/helpers/page-helper';
import { Learn } from '~/evolution/learn/entities/learn.entity';
import { groupBy } from 'lodash';

enum SpellGrimoireAction {
  ADD = 'Adicionar',
  REMOVE = 'Remover',
  LIST = 'Listar',
}
enum SpellMaestryAction {
  ADD = 'Adicionar',
  CANCEL = 'Cancelar Treino',
  LIST = 'Listar',
}

enum SpellLearnAction {
  ADD = 'Adicionar',
  LIST = 'Listar',
}

@Group({
  name: 'mod_feiticos',
  description: 'Comandos para moderar magias',
})
@Injectable()
export class SpellModGroup {
  constructor(
    private readonly spellService: SpellService,
    private readonly trainService: TrainService,
    private readonly maestryGroup: MaestryGroup,
    private readonly learnService: LearnService,
    private readonly grimoireMenu: GrimoireMenu,
  ) {}

  @Command({
    name: 'grimorio',
    description: 'Configura o grimório de um jogador',
    mod: true,
  })
  async configureGrimoire(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgPlayer({
      name: 'jogador',
      description: 'Nome do jogador',
    })
    player: Player,
    @ArgString({
      name: 'ação',
      description: 'Escola do feitiço',
      choices: Object.values(SpellGrimoireAction),
    })
    action: SpellGrimoireAction,
    @ArgString({
      name: 'feitiço',
      description: 'Nome do feitiço',
      required: false,
    })
    spellName?: string,
    @ArgInteger({
      name: 'Nivel_Feitico',
      description: 'Nível do feitiço',
      required: false,
    })
    level?: number,
    @ArgString({
      name: 'Escola_Magica',
      description: 'Escola do feitiço',
      required: false,
      choices: Object.entries(MagicSchoolPtBr).map(([key, value]) => ({
        name: value,
        value: key,
      })),
    })
    category?: MagicSchoolKeys,
    @ArgString({
      name: 'Dificuldade_Feitico',
      description: 'Dificuldade do feitiço',
      required: false,
    })
    difficulty?: SpellDifficultyEnum,
  ) {
    let spell: Spell;

    if (spellName) {
      spell = await this.spellService.findOneOrFail({
        where: {
          name: ILike(spellName),
          guild: {
            id: guild.id,
          },
        },
      });
    }
    switch (action) {
      case SpellGrimoireAction.ADD:
        await this.learnService.remove({
          spell: {
            id: spell.id,
          },
          player: {
            id: player.id,
          },
        });
        await this.grimoireMenu.learnSpell(
          interaction,
          player,
          guild,
          spellName,
        );
        await this.learnService.remove({
          spell: {
            id: spell.id,
          },
          player: {
            id: player.id,
          },
        });
        break;
      case SpellGrimoireAction.REMOVE:
        await this.grimoireMenu.unlearnGrimoire(
          interaction,
          player,
          guild,
          spellName,
        );
        break;
      case SpellGrimoireAction.LIST:
        await this.grimoireMenu.listGrimoire(
          interaction,
          player,
          level,
          category,
          difficulty,
        );
      default:
        break;
    }
  }

  @Command({
    name: 'maestria',
    description: 'Configura a maestria de um jogador',
    mod: true,
  })
  async configureMaestry(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgPlayer()
    author: Player,
    @ArgPlayer({
      name: 'jogador',
      description: 'Nome do jogador',
    })
    player: Player,
    @ArgString({
      name: 'ação',
      description: 'Escola do feitiço',
      choices: Object.values(SpellMaestryAction),
    })
    action: SpellMaestryAction,
    @ArgString({
      name: 'ID',
      description: 'Id de cancelamento informado no log',
      required: false,
    })
    id?: string,
    @ArgInteger({
      name: 'Quantidade',
      description: 'Quantidade de pontos de maestria a serem adicionados',
      required: false,
    })
    amount?: number,
    @ArgString({
      name: 'Feitiço',
      description: 'Nome do feitiço',
      required: false,
    })
    spellName?: string,
  ) {
    switch (action) {
      case SpellMaestryAction.ADD:
        if (!amount)
          throw new DiscordSimpleError(
            'Você precisa informar a quantidade de XP do treino',
          );
        await this.addMaestryXP(
          interaction,
          author,
          player,
          guild,
          amount,
          spellName,
        );
        break;
      case SpellMaestryAction.LIST:
        await this.maestryGroup.spellsTrains(interaction, player);

        break;
      case SpellMaestryAction.CANCEL:
        if (!id)
          throw new DiscordSimpleError(
            'Você precisa informar o ID do treino a ser cancelado',
          );
        await this.cancelTrainById(interaction, guild, id);
        break;
      default:
        break;
    }
  }
  async cancelTrainById(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'ID',
      description: 'Id de cancelamento informado no log',
    })
    id: string,
  ) {
    await interaction.deferReply({ ephemeral: true });
    const train = await this.trainService.findOne({
      where: {
        id,
        player: {
          guildId: guild.id,
        },
      },
      relations: {
        player: true,
      },
    });
    if (!train) {
      throw new DiscordSimpleError('Treino não encontrado');
    }

    const removed = await this.trainService.remove({
      id: train.id,
    });
    await interaction.followUp({
      content: `${removed.affected} treino cancelado...`,
      embeds: [train.toEmbed()],
      ephemeral: true,
    });
    if (!guild.trainLogChannel) return;
    await guild.trainLogChannel.send({
      content: `Treino de <@${train.player.discordId}> cancelado por <@${interaction.user.id}>`,
      embeds: [train.toEmbed()],
    });
  }
  async addMaestryXP(
    interaction: CommandInteraction,
    author: Player,
    target: Player,
    guild: Guild,
    amount: number,
    spellName: string,
  ) {
    const spell = await this.spellService.findOne({
      where: {
        name: ILike(spellName),
        guildId: guild.id,
      },
    });
    if (!spell) {
      throw new DiscordSimpleError('Feitiço não encontrado');
    }
    const train = await this.trainService.create({
      player: target,
      playerId: target.id,
      channelId: interaction.channelId,
      spell: spell,
      spellId: spell.id,
      xp: amount,
      success: 0,
      group: TrainGroupOption.PROFESSOR,
    });
    await interaction.followUp({
      content: `Adicionado ${amount} pontos de maestria ao feitiço ${
        spell.name
      }, para o jogador ${target.name || `'Sem Nome' Use /pj atualizar`}`,
    });
    if (!guild.trainLogChannel) return;
    await guild.trainLogChannel.send({
      content:
        `<@${author.discordId}> entregou ${amount} pontos do feitiço ${spell.name} para <@${target.discordId}>` +
        `\nID para cancelar: ${train.id}`,
    });
  }

  @Command({
    name: 'aprendizado',
    description: 'Configura o aprendizado de um jogador',
    mod: true,
  })
  async configureLearn(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgPlayer({
      name: 'jogador',
      description: 'Nome do jogador',
    })
    player: Player,
    @ArgString({
      name: 'ação',
      description: 'Ações disponíveis',
      choices: Object.values(SpellLearnAction),
    })
    action: SpellLearnAction,
    @ArgString({
      name: 'feitiço',
      description: 'Nome do feitiço',
      required: false,
    })
    spellName?: string,
    @ArgInteger({
      name: 'Quantidade',
      description: 'Quantidade de pontos de aprendizado a serem adicionados',
      required: false,
    })
    amount?: number,
  ) {
    await interaction.deferReply({ ephemeral: true });
    let spell: Spell;
    let learn: Learn;
    if (spellName) {
      spell = await this.spellService.findOneOrFail({
        where: {
          name: ILike(spellName),
          guild: {
            id: guild.id,
          },
        },
      });

      learn = await this.learnService.findOne({
        where: {
          spell: {
            id: spell.id,
          },
          player: {
            id: player.id,
          },
        },
      });
    }
    switch (action) {
      case SpellLearnAction.ADD:
        if (!learn) {
          learn = await this.learnService.create({
            spell,
            player,
            progress: amount || 1,
          });
          await interaction.followUp({
            content: `Adicionado ${spell.name} ao aprendizado de ${player.name}`,
          });
        } else {
          learn.progress += amount || 1;
          await this.learnService.save(learn);
          await interaction.followUp({
            content: `Adicionado ${amount} pontos de aprendizado ao feitiço ${spell.name}, para o jogador ${player.name}`,
          });
        }
        if (learn.progress >= spell.necessaryLearns) {
          await this.grimoireMenu.learnSpell(
            interaction,
            player,
            guild,
            spellName,
          );
          return;
        }
        if (learn.progress < 0) {
          await this.learnService.remove({
            id: learn.id,
          });
          await interaction.followUp({
            content: `Removido ${spell.name} do aprendizado de ${player.name}`,
          });
          return;
        }
        break;
      case SpellLearnAction.LIST:
        const learns = await this.learnService.findAll({
          where: {
            player: {
              id: player.id,
            },
          },
        });
        await new PaginationHelper({
          header: `Aprendizados de ${player.name}, Total: ${learns.length}`,
          items: learns,
          itemsPerPage: 10,
          formatter: async (learn, index, learns) => {
            return `${learn.spell.name} - ${learn.progress}/${learn.spell.necessaryLearns}`;
          },
          footer: (currentPage, totalPages) =>
            `\nPágina ${currentPage} de ${totalPages}`,
        }).followUp(interaction);
    }
  }

  @Command({
    name: 'fix_trains',
    description: 'fix_all_player_trains',
    mod: true,
  })
  async fixTrains(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
  ) {
    const trains = await this.trainService.findAll({
      where: {
        player: {
          guildId: guild.id,
        },
      },
    });

    const playerTrains = groupBy(trains, 'playerId');

    for (const [playerId, trains] of Object.entries(playerTrains)) {
      // group by day considering the definiton
      // Definition of day, the day start 9 am and ends 9 am of the next day
      const trainsByDay = groupBy(trains, (train) => {
        const date = new Date(train.createdAt);
        const todayStart = new Date(date);
        todayStart.setHours(9, 0, 0, 0);
        //If the train was made before 9 am, it should be considered as the day before
        if (date < todayStart) {
          todayStart.setDate(todayStart.getDate() - 1);
        }
        return `${todayStart.getFullYear()}-${todayStart.getMonth()}-${todayStart.getDate()}`;
      });
      console.log(playerId);
      console.log(trainsByDay);
    }
  }
}
