import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '~/core/core.entity';
import { House } from '~/core/house/house.entity';
import { HouseCup, PointLog } from './house-cup.entity';
import { Repository } from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';

@Injectable()
export class HouseCupService {
  async activateCup(cup: HouseCup) {
    cup.active = true;
    return await this.houseCup.save(cup);
  }
  constructor(
    @InjectRepository(PointLog) private pointLogRepo: Repository<PointLog>,
    @InjectRepository(HouseCup) private houseCup: Repository<HouseCup>,
  ) {}

  async createCup(name: string, guild: Guild) {
    const data = this.houseCup.create({
      name: name,
      guild: guild,
      active: true,
    });
    const cup = await this.houseCup.save(data);
    return cup;
  }
  give_points(cup: HouseCup, player: Player, value: number) {
    const data = this.pointLogRepo.create({
      cup,
      player,
      house: player.house,
      value: value,
    });
    return this.pointLogRepo.save(data);
  }
  calculate_player_points(player: Player) {}
  calculate_house_points(house: House) {}
}
