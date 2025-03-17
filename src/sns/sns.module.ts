import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SnsService } from './sns.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [SnsService],
})
export class SnSModule {}
