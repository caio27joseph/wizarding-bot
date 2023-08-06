import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { identity } from 'rxjs';
import { UpdateGuildInput } from '~/core/guild/guild.input';
import { GuildService } from '~/core/guild/guild.service';
import { SpellService } from '~/spell/spell.service';

@Injectable()
export class SeederProvider implements OnModuleInit {
  private readonly spells_path = 'spells';
  constructor(
    private readonly spellService: SpellService,
    private readonly guildService: GuildService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }
  async seed() {
    await this.spells();
  }

  async spells() {
    const directoryPath = join(
      __dirname,
      '..',
      '..',
      'seeds',
      this.spells_path,
      '/',
    );

    const files = readdirSync(directoryPath);
    for (const file of files) {
      if (extname(file) === '.json') {
        const filePath = join(directoryPath, file);
        const spellData = JSON.parse(readFileSync(filePath, 'utf8'));

        const existingSpell = await this.spellService.findOne({
          where: { id: spellData.id },
        });

        if (
          !existingSpell ||
          new Date(spellData.updatedAt) > new Date(existingSpell.updatedAt)
        ) {
          for (const guild of this.guildService.guilds.values()) {
            if (!guild.importSpells) continue;
            try {
              await this.spellService.updateOrCreate({
                guildId: guild.id,
                ...spellData,
              });
            } catch (e) {
              console.log(`Found ${spellData.name} with error ${e}}`);
            }
          }
        }
      }
    }
  }
}
