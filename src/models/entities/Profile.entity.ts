import {
    BaseEntity,
    Column,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {IsEmail} from "class-validator";
import { gender } from "../../utils/common/enum";
import {User} from "./User.entity";

@Entity('profiles')
export class Profile extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    fullName: string

    @Column()
    phone: string

    @Column()
    birthday: string

    @Column({type: 'enum', enum: gender})
    gender: gender


    @Column()
    address: string


    @OneToOne(() => User, (user) => user.profile)
    user: User

}
