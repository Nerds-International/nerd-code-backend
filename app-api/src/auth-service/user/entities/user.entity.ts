import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ nullable: true })
  age: number;
}
