import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async create(userId: number, dto: CreateExpenseDto): Promise<Expense> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const expense = this.expensesRepository.create({ ...dto, userId });
    const saved = await this.expensesRepository.save(expense);

    this.mailService
      .sendExpenseCreatedEmail(user.email, user.name, saved)
      .catch((err) => console.error('Erro ao enviar e-mail:', err.message));

    return saved;
  }

  findAll(userId: number): Promise<Expense[]> {
    return this.expensesRepository.find({ where: { userId } });
  }

  async findOne(id: number, userId: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({ where: { id } });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException();
    }

    return expense;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.findOne(id, userId);
    Object.assign(expense, dto);
    return this.expensesRepository.save(expense);
  }

  async remove(id: number, userId: number): Promise<void> {
    const expense = await this.findOne(id, userId);
    await this.expensesRepository.remove(expense);
  }
}
