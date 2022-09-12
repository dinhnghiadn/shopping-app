import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gender } from '../../utils/common/enum';
import { User } from './User.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column()
  birthday: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column()
  address: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
