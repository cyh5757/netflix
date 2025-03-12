import { Exclude, Expose, Transform } from "class-transformer";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";


export class BaseEntity{
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @VersionColumn()
  version: number;
}




@Entity() // 에노테이트 해야 테이블 만들수 있음.
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  genre: string;

}
