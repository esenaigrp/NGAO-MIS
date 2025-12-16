import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Officer } from "./Officer";

@Entity({ name: "admin_units" })
export class AdminUnit {
  @PrimaryGeneratedColumn("uuid")
  unit_id: string;

  @Column() name: string;
  @Column() level: string;
  @Column({ nullable: true }) parent_id: string;

  @OneToMany(() => Officer, officer => officer.unit)
  officers: Officer[];
}
