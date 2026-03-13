import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('deve retornar access_token com credenciais válidas', async () => {
      const hashed = await bcrypt.hash('senha123', 10);
      const user = { id: 1, email: 'user@test.com', password: hashed };

      usersService.findByEmail.mockResolvedValue(user as any);
      jwtService.sign.mockReturnValue('token-gerado');

      const result = await service.login({
        email: 'user@test.com',
        password: 'senha123',
      });

      expect(result).toEqual({ access_token: 'token-gerado' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });

    it('deve lançar UnauthorizedException quando o usuário não existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@x.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando a senha está incorreta', async () => {
      const hashed = await bcrypt.hash('correta', 10);
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'u@u.com',
        password: hashed,
      } as any);

      await expect(
        service.login({ email: 'u@u.com', password: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
