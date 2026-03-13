import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpensesService } from './expenses.service';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('ExpensesService', () => {
  let service: ExpensesService;
  let repository: jest.Mocked<Repository<Expense>>;
  let usersService: jest.Mocked<UsersService>;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: getRepositoryToken(Expense), useFactory: mockRepository },
        {
          provide: UsersService,
          useValue: { findById: jest.fn() },
        },
        {
          provide: MailService,
          useValue: { sendExpenseCreatedEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    repository = module.get(getRepositoryToken(Expense));
    usersService = module.get(UsersService);
    mailService = module.get(MailService);
  });

  describe('create', () => {
    const dto: CreateExpenseDto = {
      description: 'Almoço',
      date: '2026-01-10',
      value: 45.5,
    };

    it('deve criar uma despesa e enviar e-mail', async () => {
      const user = { id: 1, name: 'Ana', email: 'ana@teste.com' };
      const expense = { id: 1, ...dto, userId: 1 } as Expense;

      usersService.findById.mockResolvedValue(user as any);
      repository.create.mockReturnValue(expense);
      repository.save.mockResolvedValue(expense);
      mailService.sendExpenseCreatedEmail.mockResolvedValue(undefined);

      const result = await service.create(1, dto);

      expect(result).toEqual(expense);
      expect(mailService.sendExpenseCreatedEmail).toHaveBeenCalledWith(
        user.email,
        user.name,
        expense,
      );
    });

    it('deve lançar NotFoundException quando o usuário não existe', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.create(99, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar somente as despesas do usuário', async () => {
      const expenses = [{ id: 1, userId: 2 }, { id: 2, userId: 2 }] as Expense[];
      repository.find.mockResolvedValue(expenses);

      const result = await service.findAll(2);

      expect(result).toEqual(expenses);
      expect(repository.find).toHaveBeenCalledWith({ where: { userId: 2 } });
    });
  });

  describe('findOne', () => {
    it('deve retornar a despesa quando o usuário é o dono', async () => {
      const expense = { id: 1, userId: 3 } as Expense;
      repository.findOne.mockResolvedValue(expense);

      const result = await service.findOne(1, 3);

      expect(result).toEqual(expense);
    });

    it('deve lançar NotFoundException quando a despesa não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando o usuário não é o dono', async () => {
      const expense = { id: 1, userId: 5 } as Expense;
      repository.findOne.mockResolvedValue(expense);

      await expect(service.findOne(1, 99)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar a despesa', async () => {
      const expense = { id: 1, userId: 1, description: 'Antiga' } as Expense;
      const updated = { ...expense, description: 'Nova' } as Expense;

      repository.findOne.mockResolvedValue(expense);
      repository.save.mockResolvedValue(updated);

      const result = await service.update(1, 1, { description: 'Nova' });

      expect(result.description).toBe('Nova');
    });
  });

  describe('remove', () => {
    it('deve remover a despesa', async () => {
      const expense = { id: 1, userId: 1 } as Expense;
      repository.findOne.mockResolvedValue(expense);
      repository.remove.mockResolvedValue(expense);

      await expect(service.remove(1, 1)).resolves.toBeUndefined();
      expect(repository.remove).toHaveBeenCalledWith(expense);
    });
  });
});
