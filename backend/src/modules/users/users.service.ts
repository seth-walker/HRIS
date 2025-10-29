import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role', 'employee'],
      select: ['id', 'email', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'employee'],
      select: ['id', 'email', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async updateRole(id: string, roleId: string): Promise<User> {
    await this.usersRepository.update(id, { roleId });
    return this.findOne(id);
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    user.isActive = !user.isActive;
    await this.usersRepository.save(user);
    return this.findOne(id);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find();
  }
}
