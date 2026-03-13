import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];
}
