import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Player } from "~/core/core.entity";
import { Guild } from "~/core/guild/guild.entity";
import { House } from "~/core/house/house.entity";


@Entity()
export class HouseCup {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    active: boolean;

    @ManyToOne((type) => Guild, (guild) => guild.cups)
    guild: Guild;

    @OneToMany((type) => PointLog, (log) => log.player)
    pointLogs: PointLog[];
}

@Entity()
export class PointLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    value: number;

    @ManyToOne((type) => Player, (player) => player.pointLogs, {
        eager: true
    })
    player: Player;

    @ManyToOne((type) => House, (house) => house.pointLogs, {
        eager: true
    })
    house: House;

    @ManyToOne((type) => HouseCup, (cup) => cup.pointLogs, {
        eager: true
    })
    cup: HouseCup;

    @CreateDateColumn()
    createdAt: Date;
}