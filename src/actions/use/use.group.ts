import { Injectable } from '@nestjs/common';
import { CommandInteraction, Guild, GuildMember } from 'discord.js';
import _ from 'lodash';
import { ILike, Like } from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { PlayerService } from '~/core/player/player.service';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgGuild,
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { DiscordSimpleError } from '~/discord/exceptions';
import { ExtrasKeyEnum } from '~/player-system/extras/entities/extras.entity';
import { magicSchoolDisplayToKeyMap } from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { RollOptions, RollService } from '~/roll/roll.service';
import { Spell } from '~/spell/entities/spell.entity';
import { SpellService } from '~/spell/spell.service';

@Group({
  name: 'usar',
  description: 'Comandos de uso de habilidades no geral',
})
@Injectable()
export class UseGroup {
  constructor(
    private readonly spellService: SpellService,
    private readonly playerService: PlayerService,
    private readonly rollService: RollService,
  ) {}

  @Command({
    name: 'default',
    description: 'Comando padrão de uso de habilidades',
  })
  async default(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    _: Player,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'feitiço',
      description: 'Nome do feitiço',
      required: false,
    })
    spellName?: string,
    @ArgInteger({
      name: 'bonus',
      description: 'Bônus para o teste',
      required: false,
    })
    bonus?: number,
    @ArgInteger({
      name: 'autoSuccess',
      description: 'Bônus para o teste',
      required: false,
    })
    autoSuccess?: number,
  ) {
    await interaction.deferReply();

    if (spellName) {
      const player = await this.playerService.findOne({
        where: {
          id: _.id,
        },
        relations: {
          magicSchool: true,
          extras: true,
        },
      });
      if (!player.magicSchool) {
        throw new DiscordSimpleError(
          'Você não tem escola mágica configurada, use /pred_bruxa atualizar',
        );
      }
      if (!player.extras) {
        throw new DiscordSimpleError(
          'Você não tem extras configurados, use /extras atualizar',
        );
      }

      const spell = await this.spellService.findOneOrFail({
        where: {
          name: ILike(spellName),
          guild: {
            id: guild.id,
          },
        },
      });
      return this.useSpell({
        spell,
        player,
        interaction,
        options: {
          bonus,
          autoSuccess,
        },
      });
    }
  }

  async useSpell({
    spell,
    player,
    interaction,
    options,
  }: {
    spell: Spell;
    player: Player;
    interaction: CommandInteraction;
    options?: RollOptions;
  }) {
    const categories = spell.category.map((c) => magicSchoolDisplayToKeyMap[c]);
    // biggest found in player.magicSchool
    const magicSchool = categories
      .sort((a, b) => player.magicSchool[a] - player.magicSchool[b])
      .at(-1);
    const roll = await this.rollService.roll10(interaction, player, {
      magicSchool,
      extras: ExtrasKeyEnum.CONTROL,
      message: `${spell.name}`,
      identifier: spell.id,
      display: `Feitiço ${spell.name}`,
      ...options,
    });

    await interaction.followUp({
      embeds: [roll.toEmbed()],
    });
  }
}
