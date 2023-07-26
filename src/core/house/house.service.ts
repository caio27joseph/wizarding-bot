import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { House } from './house.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HouseService {
}
