import { Injectable } from '@nestjs/common';
import { HouseCup, HousePointResult } from './entities/house-cup.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CupShowCase, HousePodium } from './entities/cup-show-case.entity';
import {
  CreateCupShowCaseInput,
  UpdateCupShowCaseInput,
} from './entities/cup-show-case.input';

@Injectable()
export class CupShowCaseService {
  getShowcase(cup: HouseCup) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(CupShowCase) private repo: Repository<CupShowCase>,
  ) {}

  async getPodiums(results: HousePointResult[]) {
    const podiums: HousePodium[] = [];
    const sortedResults = results.sort((a, b) => b.total - a.total);
    for (const [index, result] of sortedResults.entries()) {
      podiums.push({
        houseId: result.house.id,
        total: result.total,
        position: index,
      });
    }
    return podiums;
  }

  isEqual(podiums1: HousePodium[], podiums2: HousePodium[]): boolean {
    if (podiums1.length !== podiums2.length) return false; // If lengths are different, they are not equal

    for (let i = 0; i < podiums1.length; i++) {
      const podium1 = podiums1[i];
      const podium2 = podiums2[i];

      if (
        podium1.position !== podium2.position ||
        podium1.houseId !== podium2.houseId ||
        podium1.total !== podium2.total
      ) {
        return false; // If any podium is different, they are not equal
      }
    }

    return true; // If loop completes, all podiums are equal
  }
  async create(input: CreateCupShowCaseInput) {
    const data = this.repo.create(input);
    const cupShowCase = await this.repo.save(data);
    return cupShowCase;
  }
  async update(
    where: FindOptionsWhere<CupShowCase>,
    input: UpdateCupShowCaseInput,
  ) {
    const result = await this.repo.update(where, input);
    return result;
  }
  async delete() {}
  async findAll(options?: FindManyOptions<CupShowCase>) {
    const cupShowCases = await this.repo.find(options);
    return cupShowCases;
  }
  async findOne(options: FindOneOptions<CupShowCase>) {
    const cupShowCase = await this.repo.findOne(options);
    return cupShowCase;
  }
}
