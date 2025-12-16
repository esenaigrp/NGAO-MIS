import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { AdminUnit } from "./AdminUnit";

@Entity({ name: "officers" })
export class Officer {
  @PrimaryGeneratedColumn("uuid")
  officer_id: string;

  @ManyToOne(() => AdminUnit)
  @JoinColumn({ name: "unit_id" })
  unit: AdminUnit;

  @Column({ nullable: true }) given_name: string;
  @Column({ nullable: true }) family_name: string;
  @Column() role: string;
  @Column({ nullable: true }) national_id: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) email: string;
  @Column({ default: 'active' }) status: string;
}
