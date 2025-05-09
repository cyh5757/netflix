import { Inject, Injectable, Logger, LoggerService } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { readdir, unlink } from "fs/promises";
import { join, parse } from "path";
import { Movie } from "src/movie/entity/movie.entity";
import { Repository, Tree } from "typeorm";
import { DefaultLogger } from "./logger/default.logger";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Injectable()
export class TasksService {
    // private readonly logger = new Logger(TasksService.name);
    constructor(
        @InjectRepository(Movie)
        private readonly movieRepository: Repository<Movie>,
        private readonly schedulerRegistry: SchedulerRegistry,
        // private readonly logger: DefaultLogger,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
    ) { }

    // @Cron('*/5 * * * * *')
    logEverySecond() {
        this.logger.error('FATAL 레벨 로그',null,TasksService.name);
        this.logger.error('ERROR 레벨 로그',null,TasksService.name);
        this.logger.warn('WARN 레벨 로그',TasksService.name);
        this.logger.log('LOG 레벨 로그',TasksService.name);
        this.logger.debug('DEBUG 레벨 로그',TasksService.name);
        this.logger.verbose('VERBOSE 레벨 로그', TasksService.name);
    }

    // @Cron('* * * * * *')
    async eraseOrphanFiles() {
        const files = await readdir(join(process.cwd(), 'public', 'temp'))

        const deleteFilesTargets = files.filter((file) => {
            const fileName = parse(file).name;
            const split = fileName.split('_');


            if (split.length != 2) {
                return true;
            }
            try {
                const date = +new Date(parseInt(split[split.length - 1]));
                const aDayInMilSec = (24 * 60 * 60 * 1000);

                const now = +new Date();

                return (now - date) > aDayInMilSec;
            } catch (e) {
                return true;
            }
        });

        /// 병렬화
        await Promise.all(
            deleteFilesTargets.map(
                (x) => unlink(join(process.cwd(), 'public', 'temp', x))
            )
        );

        //직렬화
        // for(let i=0; i< deleteFilesTargets.length; i++){
        //     const fileName = deleteFilesTargets[i];

        //     await unlink(join(process.cwd(), 'public','temp',fileName))
        // }

    }

    // @Cron('0 * * * * *')
    async calculateMovieLikeCounts() {
        console.log('run');
        await this.movieRepository.query(
`
UPDATE movie m
SET "likeCount" =(
	SELECT count(*) FROM movie_user_like mul
	WHERE m.id = mul."movieId" AND mul."isLike" = true
)
`
        )
        await this.movieRepository.query(
`
UPDATE movie m
SET "dislikeCount" =(
	SELECT count(*) FROM movie_user_like mul
	WHERE m.id = mul."movieId" AND mul."isLike" = false
)
`
        )
    }

    // @Cron('* * * * * *',{
    //     name: 'printer'
    // })
    // printer(){
    //     console.log('print every seconds')
    // }
    // @Cron('*/5 * * * * *')
    // stopper() {
    //   console.log('--- stopper run ---');
    //   const job = this.schedulerRegistry.getCronJob('printer');
      

    //     // console.log('# Last Date');
    //     // console.log(job.lastDate());
        
    //     // console.log('# Last Date');
    //     // console.log(job.nextDate());

    //     // console.log('# Last Date');
    //     // console.log(job.nextDates(5));
    //     if(job.isCallbackRunning){
    //         job.stop();
    //     }
    //     else{
    //         job.start();
    //     }
    // }

}
