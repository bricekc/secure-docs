import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserInput } from './dto/CreateUserInput';
import * as bcrypt from 'bcrypt';
import { LogProducerService } from 'src/log/log-producer.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private logProducerService: LogProducerService,
  ) {}

  async create(data: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    await this.logProducerService.addLog('user', `User ${user.email} created`);

    return user;
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findAll() {
    return this.prisma.user.findMany();
  }
}
