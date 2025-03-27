import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ){}
  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user =  await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if(!user){
      throw new NotFoundException(`존재하지않는 사용자 ID ${id}`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    })
    if(!user){
      throw new NotFoundException(`존재하지않는 사용자 ID ${id}`);
    }
    await this.userRepository.update({id},
      updateUserDto,
    );
    
    return this.userRepository.findOne({
      where: {
        id,
      },
    })
  }

  remove(id: number) {
    return this.userRepository.delete(id)
  }
}
