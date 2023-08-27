import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { identity } from 'rxjs';
import { UpdateGuildInput } from '~/core/guild/guild.input';
import { GuildService } from '~/core/guild/guild.service';
import { WandCoreService } from '~/items/wand/wand-core.service';
import { WandWoodService } from '~/items/wand/wand-wood.service';
import { SpellService } from '~/spell/spell.service';

@Injectable()
export class SeederProvider implements OnModuleInit {
  private readonly spells_path = 'spells';
  private readonly wand_wood_path = 'wand_woods';
  private readonly wand_cores_path = 'wand_cores';
  constructor(
    private readonly spellService: SpellService,
    private readonly guildService: GuildService,
    private readonly wandWoodService: WandWoodService,
    private readonly wandCoreService: WandCoreService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }
  async seed() {
    await this.wand_wood();
    await this.spells();
    await this.wand_core();
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
          where: { identifier: spellData.identifier },
        });
        if (
          !existingSpell ||
          new Date(spellData.updatedAt) > new Date(existingSpell.updatedAt)
        ) {
          for (const guild of this.guildService.guilds.values()) {
            if (!guild.importSpells) continue;
            try {
              const speel = await this.spellService.updateOrCreate({
                guildId: guild.id,
                ...spellData,
              });
              console.log(`Found ${speel.name}`);
            } catch (e) {
              console.log(`Found ${spellData.name} with error ${e}}`);
            }
          }
        }
      }
    }
  }

  async wand_wood() {
    const directoryPath = join(
      __dirname,
      '..',
      '..',
      'seeds',
      this.wand_wood_path,
      '/',
    );

    const files = readdirSync(directoryPath);
    for (const file of files) {
      if (extname(file) === '.json') {
        const filePath = join(directoryPath, file);
        const woodData = JSON.parse(readFileSync(filePath, 'utf8'));

        const existingSpell = await this.wandWoodService.findOne({
          where: { identifier: woodData.identifier },
        });
        if (
          !existingSpell ||
          new Date(woodData.updatedAt) > new Date(existingSpell.updatedAt)
        ) {
          for (const guild of this.guildService.guilds.values()) {
            if (!guild.importSpells) continue;
            try {
              const wood = await this.wandWoodService.updateOrCreate({
                guildId: guild.id,
                ...woodData,
              });
              console.log(`Found ${wood.name}`);
            } catch (e) {
              console.log(`Found ${woodData.name} with error ${e}}`);
            }
          }
        }
      }
    }
  }

  async wand_core() {
    const directoryPath = join(
      __dirname,
      '..',
      '..',
      'seeds',
      this.wand_cores_path,
      '/',
    );

    const files = readdirSync(directoryPath);
    for (const file of files) {
      if (extname(file) === '.json') {
        const filePath = join(directoryPath, file);
        const coreData = JSON.parse(readFileSync(filePath, 'utf8'));

        const existingSpell = await this.wandCoreService.findOne({
          where: { identifier: coreData.identifier },
        });
        if (
          !existingSpell ||
          new Date(coreData.updatedAt) > new Date(existingSpell.updatedAt)
        ) {
          for (const guild of this.guildService.guilds.values()) {
            if (!guild.importSpells) continue;
            try {
              const core = await this.wandCoreService.updateOrCreate({
                guildId: guild.id,
                ...coreData,
              });
              console.log(`Found ${core.name}`);
            } catch (e) {
              console.log(`Found ${coreData.name} with error ${e}}`);
            }
          }
        }
      }
    }
  }
}
