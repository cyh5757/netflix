import { Exclude, Expose, Transform } from "class-transformer";
import { ChildEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn, VersionColumn } from "typeorm";


@Entity()
@TableInheritance({
  column:{
    type: "varchar",
    name: "type"
  }
})


export class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @VersionColumn()
  version: number;
}

/// movie /series -> Content
/// runtime(영화 상영시간)  / seriesCount(몇개 부작인지)

@Entity()
export class Content extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  genre: string;
}

@ChildEntity() // 에노테이트 해야 테이블 만들수 있음.
export class Movie extends Content {

  @Column()
  runtime: number;

}

@ChildEntity()
export class Series extends Content {

  @Column()
  seriesCount: number;

}