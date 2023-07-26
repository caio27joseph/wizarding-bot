import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany } from "typeorm";
import { Guild } from "../guild/guild.entity";
import { PointLog } from "~/house-cup/house-cup.entity";
import { Player } from "../core.entity";



@Entity()
export class House {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    discordRoleId: string;

    @ManyToOne(type => Guild, guild => guild.players)
    guild: Guild;

    @OneToMany((type) => PointLog, (log) => log.player)
    pointLogs: PointLog[];

    @OneToMany(type => Player, player => player.guild)
    players: Player[];

}

