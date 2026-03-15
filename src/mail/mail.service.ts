import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendExpenseCreatedEmail(
    to: string,
    name: string,
    expense: Expense,
  ): Promise<void> {
    const date = expense.date.split('-').reverse().join('/');

    try {
      await this.transporter.sendMail({
        from: `"Onfly" <${this.config.get('MAIL_FROM')}>`,
        to,
        subject: 'despesa cadastrada',
        html: `
        <p>Olá, ${name}!</p>
        <p>Sua despesa foi cadastrada com sucesso:</p>
        <ul>
          <li><strong>Descrição:</strong> ${expense.description}</li>
          <li><strong>Data:</strong> ${date}</li>
          <li><strong>Valor:</strong> R$ ${Number(expense.value).toFixed(2)}</li>
        </ul>
      `,
      });
    } catch (error) {
      console.error(`Falha ao enviar e-mail para ${to}:`, error.message);
    }
  }
}
