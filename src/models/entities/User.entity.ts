import {
    AfterLoad,
    BaseEntity, BeforeInsert, BeforeUpdate,
    Column, CreateDateColumn,
    Entity, JoinColumn, OneToMany, OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm"
import {IsEmail, MaxLength, MinLength} from "class-validator"
import {Exclude, instanceToPlain} from "class-transformer"
import {hashPassword} from "../../utils/common/bcrypt";
import {gender, role, user_status} from "../../utils/common/enum";
import {Profile} from "./Profile.entity";
import {Cart} from "./Cart.entity";
import {Order} from "./Order.entity";



@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true, readonly: true})
    @MinLength(3, {message: 'Username too short, min length is $constraint1!'})
    @MaxLength(10, {message: 'Username too short, min length is $constraint1!'})
    username: string

    @Column({unique: true})
    @IsEmail()
    email: string

    @Exclude()
    @Column()
    @MinLength(4, {message: 'Password too short, min length is $constraint1!'})
    @MaxLength(20, {message: 'Password too long, max length is $constraint1!'})
    password: string

    @Exclude()
    tempPassword: string;

    @Column({type: 'enum', enum: user_status, default: user_status.NotVerified})
    status: user_status

    @Column({type: 'enum', enum: role, default: role.User})
    role: role

    @Exclude()
    @Column("varchar", { length: 500 ,nullable:true})
    resetToken: string

    @OneToOne(() => Profile, (profile) => profile.user,{cascade:true})
    @JoinColumn({name: 'profileId'})
    profile: Profile

    @OneToOne(() => Cart, (cart) => cart.user,{cascade:true,eager:true})
    @JoinColumn({name: 'cartId'})
    cart: Cart

    @OneToMany(() => Order, (order) => order.user,{cascade:true,eager:true})
    orders: Order[]

    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

    @Column()
    lastLogin: Date

    @AfterLoad()
    loadTempPassword(): void {
        this.tempPassword = this.password;
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashingPassword() {
        if (this.tempPassword !== this.password) {
            try {
                this.password = await hashPassword(this.password)

            } catch (e) {
                throw new Error('There are some issues in the hash!')
            }
        }
    }

    toJSON() {
        return instanceToPlain(this)
    }
}

