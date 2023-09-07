import { Injectable } from '@nestjs/common';
import { Train, TrainGroupOption } from './entities/train.entity';
import { Spell, SpellDifficultyEnum } from '~/spell/entities/spell.entity';
import { MoreThan, Not, IsNull } from 'typeorm';
import { ButtonInteraction, CacheType } from 'discord.js';
import { createCanvas } from 'canvas';
import { groupBy, sumBy } from 'lodash';
import { TrainService } from './train.service';
import { generateProgressBarEmoji } from '~/utils/emojiProgressBar';
import { OnEvent } from '@nestjs/event-emitter';
import { SpellTrainEvent } from './train-spell.menu';
import { LearnService } from '../learn/learn.service';
import { DiscordSimpleError } from '~/discord/exceptions';
import { Player } from '~/core/player/entities/player.entity';

export class MaxSpellsTrainReached extends Error {}
export class MaxSpellDayTrainReached extends Error {}

@Injectable()
export class TrainSpellService {
  constructor(
    private readonly trainService: TrainService,
    private readonly learnService: LearnService,
  ) {}

  canDoubleTrain({
    spell,
    todayTrains: trains,
  }: {
    spell: Spell;
    todayTrains: Train[];
  }) {
    const trainingForThisSpell = trains.filter((t) => t.spellId === spell.id);
    const someDoubleTrain = trainingForThisSpell.some((t) => t.double);
    if (
      trains.length >= 5 ||
      trainingForThisSpell.length >= 1 ||
      someDoubleTrain
    ) {
      return false;
    }
    return true;
  }

  async validate({
    spell,
    todayTrains: trains,
    player,
  }: {
    spell: Spell;
    todayTrains: Train[];
    player: Player;
  }) {
    if (trains.length >= 6) {
      throw new MaxSpellsTrainReached(`Você já treinou demais hoje!`);
    }
    const trainingForThisSpell = trains.filter((t) => t.spellId === spell.id);
    const someDoubleTrain = trainingForThisSpell.some((t) => t.double);
    if (trainingForThisSpell.length >= 2 || someDoubleTrain) {
      throw new MaxSpellDayTrainReached(
        `Você já treinou ${spell.name} demais hoje!`,
      );
    }
    const completed = await this.trainService.findOne({
      where: {
        spellId: spell.id,
        playerId: player.id,
        completed: true,
      },
    });

    if (completed) {
      throw new DiscordSimpleError('Você já completou o treino desse feitiço');
    }

    const learn = await this.learnService.findOne({
      where: {
        spell: { id: spell.id },
        player: { id: player.id },
      },
    });

    if (learn && learn.progress < spell.necessaryLearns) {
      throw new DiscordSimpleError(
        `Você ainda não estudou o suficiente para treinar\nProgresso: ${learn.progress}/${spell.necessaryLearns}`,
      );
    }
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

  async playerTrains(playerId: string) {
    return await this.trainService.findAll({
      where: {
        playerId: playerId,
        spellId: Not(IsNull()),
      },
      relations: {
        spell: true,
      },
    });
  }
  spellTotalXpMap(trains: Train[]) {
    const groupedTrains = groupBy(trains, (train) => train.spellId);
    const xpTotalsBySpell: { [key: string]: number } = {};
    for (const spellId in groupedTrains) {
      xpTotalsBySpell[spellId] = sumBy(groupedTrains[spellId], 'xp');
    }
    return xpTotalsBySpell;
  }

  getSortedSpellsByXP(trains: any[]) {
    const xpTotalsBySpell = this.spellTotalXpMap(trains);

    return Object.entries(xpTotalsBySpell).sort(([, a], [, b]) => b - a);
  }

  async formatSpellForDisplay(spellId: string, totalXP: number, trains: any[]) {
    const groupedTrains = groupBy(trains, (train) => train.spellId);
    const spell = groupedTrains[spellId][0].spell;
    const { necessaryXP } = await this.progressData({
      spell,
      trains,
    });
    const currentLevel = Math.ceil(totalXP / necessaryXP);
    const xpTowardsNextLevel = totalXP % necessaryXP;
    const progressBar = generateProgressBarEmoji(
      xpTowardsNextLevel,
      necessaryXP,
    );

    let response = `**${spell.name}**\n`;
    response += `Nível atual: ${currentLevel}\n`;
    response += `XP ${progressBar} ${xpTowardsNextLevel}/${necessaryXP}\n`;
    response += '---';
    return response;
  }

  @OnEvent('spell-train')
  async onSpellTrain({ train }: SpellTrainEvent) {
    const trains = await this.trainService.findAll({
      where: {
        playerId: train.playerId,
        spellId: train.spellId,
      },
    });
    const oldTrains = trains.filter((t) => t.id !== train.id);
    const oldProgress = await this.progressData({
      spell: train.spell,
      trains: oldTrains,
    });

    const newProgress = await this.progressData({
      spell: train.spell,
      trains,
    });
    const oldLevel = oldProgress.currentLevel;
    const newLevel = newProgress.currentLevel;

    if (oldLevel === newLevel) {
      return;
    }
    if (newLevel === 3) {
      await this.learnService.remove({
        player: {
          id: train.playerId,
        },
        spell: {
          id: train.spellId,
        },
      });
    }
    if (newLevel === 5) {
      await this.trainService.delete({
        playerId: train.playerId,
        spellId: train.spellId,
      });
      await this.trainService.create({
        playerId: train.playerId,
        spellId: train.spellId,
        xp: newProgress.necessaryXP * 5,
        group: TrainGroupOption.FLAT,
        double: train.double,
        completed: true,
      });
    }
  }
}
