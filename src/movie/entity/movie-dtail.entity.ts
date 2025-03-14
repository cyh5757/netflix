import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Movie } from "./movie.entity";




@Entity()
export class MovieDetail{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    detail: string;

    @OneToOne(
        //relation에는 무조건 함수넣고, 타입까지
        () => Movie,
        movie => movie.id,
    )
    movie: Movie;

}