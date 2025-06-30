import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt-ts';
import { LogProducerService } from 'src/log/log-producer.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private logProducerService: LogProducerService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user)
      throw new UnauthorizedException('Email ou mot de passe incorrect');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('Email ou mot de passe incorrect');

    const payload = { id: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    await this.logProducerService.addLog(
      'auth',
      `User ${user.email} logged in successfully`,
    );

    return { access_token };
  }
}
