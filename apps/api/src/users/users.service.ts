import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { UserStatus } from "./user.enums";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id, status: UserStatus.Active } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email.toLowerCase(), status: UserStatus.Active } });
  }

  async updateLastLogin(userId: string, loggedInAt: Date): Promise<void> {
    await this.usersRepository.update({ id: userId }, { lastLoginAt: loggedInAt });
  }
}
