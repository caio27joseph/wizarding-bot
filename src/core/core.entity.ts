import { Column, Entity, Index, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Guild } from "./guild/guild.entity";
import { PointLog } from "~/house-cup/house-cup.entity";
import { House } from "./house/house.entity";



@Entity()
export class Player {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 500 })
    name: string;

    @Column('text')
    description: string;

    @Index()
    @Column()
    discordId: string;

    @ManyToOne(type => Guild, guild => guild.players)
    guild: Guild;

    @ManyToOne(type => House, house => house.players)
    house: House

    @OneToMany((type) => PointLog, (log) => log.player)
    pointLogs: PointLog[];
}

