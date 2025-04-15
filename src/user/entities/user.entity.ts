import { Exclude } from "class-transformer";
import { BaseTable } from "src/common/entity/base-table.entity";
import { MovieUserLike } from "src/movie/entity/movie-user-like.entity";
import { Movie } from "src/movie/entity/movie.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


export enum Role {
    admin,
    paidUser,
    user,
}



@Entity()
export class User extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        //절대 겹칠수가 없는값
        unique: true,
    })
    email: string;

    @Column()
    @Exclude({
        // 우리가 요청받을때
        toClassOnly: true,
        // 우리가 응답 보낼때
        toPlainOnly: true,
    })
    password: string;

    //enum을 사용할때의 룰
    // enum 사용을 명시, default 명시
    @Column({
        enum: Role,
        default: Role.user,
    })
    role: Role;

    @OneToMany(
        () => Movie,
        (movie) => movie.creator,
    )
    createdMovies: Movie[];


    @OneToMany(
        () => MovieUserLike,
        (mul) => mul.user,
    )
    likedMovies: MovieUserLike[]

}
