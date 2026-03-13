import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 191 })
  description: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.expenses)
  @JoinColumn({ name: 'userId' })
  user: User;
}
