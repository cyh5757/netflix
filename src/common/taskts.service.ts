import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { readdir, unlink } from "fs/promises";
import { join, parse } from "path";
import { Tree } from "typeorm";

@Injectable()
export class TasksService{
    constructor(){}
    
    logEverySecond(){
        console.log('1초마다 실행!')
    }

    @Cron('* * * * * *')
    async eraseOrphanFiles(){
        const files = await readdir(join(process.cwd(),'public','temp'))
        
        const deleteFilesTargets = files.filter((file)=>{
            const fileName = parse(file).name;
            const split = fileName.split('_');


            if(split.length != 2){
                return true;
            }
            try{
                const date = +new Date(parseInt(split[split.length-1]));
                const aDayInMilSec = (24 * 60 * 60 * 1000);

                const now = +new Date();

                return (now - date) > aDayInMilSec;
            }catch(e){
                return true;
            }
        });

        /// 병렬화
        await Promise.all(
            deleteFilesTargets.map(
                (x) => unlink(join(process.cwd(), 'public','temp',x))
            )
        );

        //직렬화
        // for(let i=0; i< deleteFilesTargets.length; i++){
        //     const fileName = deleteFilesTargets[i];

        //     await unlink(join(process.cwd(), 'public','temp',fileName))
        // }

    }

}
