import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {image_type, owner} from "../../utils/common/enum";

@Entity('images')
export class Image extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @Column()
    ownerId: number

    @Column({type: 'enum', enum: owner})
    belongTo: owner

    @Column({default:true})
    primary: boolean
}
