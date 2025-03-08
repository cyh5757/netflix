import { Module } from '@nestjs/common';

import { MovieModule } from './movie/movie.module';

/// 중앙집합 모듈.

@Module({
  imports: [MovieModule],
})
export class AppModule {}
