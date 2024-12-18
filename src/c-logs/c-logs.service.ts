import { Injectable } from '@nestjs/common';
import { CreateCLogDto } from './dto/create-c-log.dto';
import { UpdateCLogDto } from './dto/update-c-log.dto';

@Injectable()
export class CLogsService {
  create(createCLogDto: CreateCLogDto) {
    return 'This action adds a new cLog';
  }

  findAll() {
    return `This action returns all cLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cLog`;
  }

  update(id: number, updateCLogDto: UpdateCLogDto) {
    return `This action updates a #${id} cLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} cLog`;
  }
}
