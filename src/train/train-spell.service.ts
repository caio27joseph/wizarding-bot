import { Injectable } from '@nestjs/common';
import { Train } from './entities/train.entity';
import { Spell, SpellDifficultyEnum } from '~/spell/entities/spell.entity';
import { TrainService } from './train.service';
import { MoreThan, Not, IsNull } from 'typeorm';
import { ButtonInteraction, CacheType } from 'discord.js';
import { createCanvas } from 'canvas';

export class MaxSpellsTrainReached extends Error {}
export class MaxSpellDayTrainReached extends Error {}

@Injectable()
export class TrainSpellService {
  constructor(private readonly trainService: TrainService) {}

  canDoubleTrain({
    spell,
    todayTrains: trains,
  }: {
    spell: Spell;
    todayTrains: Train[];
  }) {
    const trainingForThisSpell = trains.filter((t) => t.spellId === spell.id);
    if (trains.length >= 5 || trainingForThisSpell.length >= 1) {
      return false;
    }
    return true;
  }

  async validate({
    spell,
    todayTrains: trains,
  }: {
    spell: Spell;
    todayTrains: Train[];
  }) {
    if (trains.length >= 6) {
      throw new MaxSpellsTrainReached(`Você já treinou demais hoje!`);
    }
    const trainingForThisSpell = trains.filter((t) => t.spellId === spell.id);

    if (trainingForThisSpell.length >= 2) {
      throw new MaxSpellDayTrainReached(
        `Você já treinou ${spell.name} demais hoje!`,
      );
    }
    return true;
  }

  async getTodayTrains(playerId: string) {
    const now = new Date();
    const today6am = new Date(now);
    today6am.setHours(9, 0, 0, 0);

    let startTime: Date;
    if (now < today6am) {
      startTime = new Date(today6am.getTime() - 24 * 60 * 60 * 1000);
    } else {
      startTime = today6am;
    }
    const trains = await this.trainService.findAll({
      where: {
        playerId,
        createdAt: MoreThan(startTime),
        spellId: Not(IsNull()),
      },
    });
    return trains;
  }
  private spellMaestryLevelModMap = {
    [SpellDifficultyEnum.EASY]: 2,
    [SpellDifficultyEnum.MEDIUM]: 4,
    [SpellDifficultyEnum.HARD]: 6,
    [SpellDifficultyEnum.VERY_HARD]: 8,
  };
  getSpellNecessaryUpXP(spell: Spell) {
    const cap =
      spell.level * 100 * this.spellMaestryLevelModMap[spell.difficulty];
    return cap;
  }

  async progressData({ trains, spell }: { trains: Train[]; spell: Spell }) {
    const totalXp = trains.reduce((acc, train) => acc + train.xp, 0);
    const totalSuccess = trains.reduce((acc, train) => acc + train.success, 0);
    const totalTrains = trains.length;

    const necessaryXP = this.getSpellNecessaryUpXP(spell);
    const currentLevel = Math.ceil(totalXp / necessaryXP) || 1;
    const xpTowardsNextLevel = totalXp % necessaryXP;

    const progress = {
      totalXp,
      totalSuccess,
      totalTrains,
      necessaryXP,
      currentLevel,
      xpTowardsNextLevel,
    };
    return progress;
  }

  createSpellMasteryImage(currentValue: number, maxLevel: number): Buffer {
    const canvas = createCanvas(300, 25);
    const ctx = canvas.getContext('2d');

    const progressBarPercentage = (currentValue / maxLevel) * 100;

    // Transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the progress bar background
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(10, 2.5, canvas.width - 20, 20);

    // Draw the actual progress bar
    ctx.fillStyle = '#0099ff';
    ctx.fillRect(
      10,
      2.5,
      (canvas.width - 20) * (progressBarPercentage / 100),
      20,
    );

    return canvas.toBuffer();
  }
}