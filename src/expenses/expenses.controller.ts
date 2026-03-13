import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.expensesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.expensesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.expensesService.remove(id, req.user.id);
  }
}
