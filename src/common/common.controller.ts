import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('common')
@ApiBearerAuth()
@ApiTags('common')
export class CommonController {

    @Post('video')
    @UseInterceptors(FileInterceptor('video', {
        limits: {
            fileSize: 20000000,
        },
        fileFilter(req, file, callback) {
            console.log(file);

            if (file.mimetype !== 'video/mp4') {
                return callback(new BadRequestException('mp4 타입만 업로드 가능!'),
                    false
                )
            }
            return callback(null, true);
        }
    }))

    createVideo(
        @UploadedFile() movie: Express.Multer.File,
    ) {
       return {
        fileName: movie.filename,
       }
    } 


}
