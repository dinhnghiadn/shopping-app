import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {Owner} from "../../utils/common/enum";

@Entity('images')
export class Image extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @Column({nullable:true})
    ownerId: number

    @Column({type: 'enum', enum: Owner})
    belongTo: Owner

    @Column({default:true})
    primary: boolean
}
