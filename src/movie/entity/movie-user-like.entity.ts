import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Movie } from "./movie.entity";

@Entity()
export class MovieUserLike{
    
    @PrimaryColumn({
        name: 'movieId',
        type: 'int8'
    })
    @ManyToOne(
        ()=>Movie,
        (movie) => movie.likedUsers,
        {
            onDelete: 'CASCADE',
        }
    )
    movie: Movie;

    @PrimaryColumn({
        name: 'userId',
        type: 'int8'
    })
    @ManyToOne(
        ()=> User,
        (user) => user.likedMovies,
        {
            onDelete: 'CASCADE',
        }
    )
    user:User;

    @Column()
    isLike: boolean

}