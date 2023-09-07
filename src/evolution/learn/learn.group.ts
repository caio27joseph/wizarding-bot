import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgGuild,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { LearnService } from './learn.service';
import { Guild } from '~/core/guild/guild.entity';
import { ILike } from 'typeorm';
import { SpellService } from '~/spell/spell.service';
import { Player } from '~/core/player/entities/player.entity';
import { PlayerService } from '~/core/player/player.service';
import { RollsD10 } from '~/roll/entities/roll.entity';
import { waitForEvent } from '~/utils/wait-for-event';
import { RollEvent } from '~/roll/roll.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { magicSchoolKeyToDisplayMap } from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { Spell } from '~/spell/entities/spell.entity';
import { GrimoireService } from '~/grimoire/grimoire.service';

@Group({
  name: 'aprender',
  description: 'Comandos para aprender magias',
})
@Injectable()
export class LearnGroup {
  constructor(
    private readonly learnService: LearnService,
    private readonly spellService: SpellService,
    private readonly grimoireService: GrimoireService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Command({
    name: 'default',
    description: 'Aprende uma magia',
  })
  async learn(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgPlayer()
    player: Player,
    @ArgString({
      name: 'feitiço',
      description: 'Nome do feitiço',
      required: false,
    })
    spellName?: string,
  ) {
    await interaction.deferReply({ ephemeral: true });

    if (!spellName) {
      await interaction.editReply('Você precisa informar o nome do feitiço');
      return;
    }
    const spell = await this.spellService.findOneOrFail({
      where: {
        name: ILike(spellName),
        guild: {
          id: guild.id,
        },
      },
    });

    const grimoire = await this.grimoireService.getOrCreate(
      {
        where: {
          player: {
            id: player.id,
          },
        },
      },
      {
        player,
        spells: [],
        playerId: player.id,
      },
    );
    if (grimoire.spells.find((s) => s.id === spell.id)) {
      await interaction.editReply(
        `Você já tem o feitiço ${spell.name} no grimório`,
      );
      return;
    }

    const learn = await this.learnService.getOrCreate(
      {
        where: {
          spell: {
            id: spell.id,
          },
          player: {
            id: player.id,
          },
        },
      },
      {
        spell,
        player,
        progress: 0,
      },
    );
    if (learn.progress >= spell.necessaryLearns) {
      await interaction.editReply(
        `Você já aprendeu o feitiço ${spell.name} com progresso ${learn.progress}/${spell.necessaryLearns}`,
      );
      return;
    }
    const success = await this.getRolls({
      interaction,
      spell,
      player,
    });
    if (!success) {
      await interaction.followUp(
        `Você falhou em aprender o feitiço ${spell.name}`,
      );
      return;
    }
    learn.progress += 1;
    await this.learnService.save(learn);
    if (learn.progress >= spell.necessaryLearns) {
      grimoire.spells.push(spell);
      await this.grimoireService.save(grimoire);
      await interaction.followUp(
        `Você aprendeu o feitiço ${spell.name} e ele foi adicionado ao grimório`,
      );
      return;
    }

    await interaction.followUp(
      `Você aprendeu o feitiço ${spell.name} com progresso ${learn.progress}/${spell.necessaryLearns}`,
    );
  }

  async getRolls({
    interaction,
    spell,
    player,
  }: {
    interaction: CommandInteraction;
    spell: Spell;
    player: Player;
  }) {
    await interaction.editReply({
      content:
        `Você precisa rolar o treino!\n` +
        spell.category
          .map(
            (c) =>
              `Use /dr atributo:Inteligência hab1:Acadêmicos escola_magica:${c}`,
          )
          .join('\n ou '),
    });
    let chances = 3;
    for (let i = 0; i < chances; i++) {
      const { roll }: RollEvent = await waitForEvent(
        this.eventEmitter,
        'roll',
        (data: RollEvent) => {
          const samePlayer = data.player.id === player.id;
          const sameChannel =
            data.interaction.channelId === interaction.channelId;
          const correctAttribute = data.options.attribute === 'intelligence';
          const correctAbility = data.options.hab1 === 'academics';
          const correctMagicSchool = spell.category.includes(
            magicSchoolKeyToDisplayMap[data.options.magicSchool],
          );

          return (
            samePlayer &&
            sameChannel &&
            correctAttribute &&
            correctAbility &&
            correctMagicSchool
          );
        },
      );
      if (roll.total >= spell.metaValue) {
        return true;
      }
      if (i < chances - 1) {
        await interaction.followUp({
          content: `Você falhou, mas pode tentar mais ${chances - i - 1} vezes`,
        });
      }
    }
    return false;
  }
}
