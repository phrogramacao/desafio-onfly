import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('deve criar um novo usuário e retornar sem a senha', async () => {
      const dto = { name: 'Maria', email: 'maria@teste.com', password: '123456' };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue({ id: 1, ...dto } as User);
      repository.save.mockResolvedValue({ id: 1, ...dto } as User);

      const result = await service.create(dto);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', dto.email);
    });

    it('deve lançar ConflictException quando o e-mail já existe', async () => {
      repository.findOne.mockResolvedValue({ id: 1 } as User);

      await expect(
        service.create({ name: 'X', email: 'x@x.com', password: '123456' }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve salvar a senha como hash', async () => {
      const dto = { name: 'Carlos', email: 'carlos@teste.com', password: 'senhasecreta' };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockImplementation((data) => data as User);
      repository.save.mockImplementation(async (data) => data as User);

      await service.create(dto);

      const callArgs = repository.create.mock.calls[0][0] as User;
      expect(callArgs.password).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, callArgs.password)).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('deve retornar o usuário pelo e-mail', async () => {
      const user = { id: 1, email: 'test@test.com' } as User;
      repository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('test@test.com');

      expect(result).toEqual(user);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });

    it('deve retornar null quando o e-mail não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('naoexiste@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('deve retornar o usuário pelo id', async () => {
      const user = { id: 5, name: 'Ana' } as User;
      repository.findOne.mockResolvedValue(user);

      const result = await service.findById(5);

      expect(result).toEqual(user);
    });
  });
});
