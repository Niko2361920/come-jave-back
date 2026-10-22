import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Cédula u otro documento: dato sensible y opcional; ya no es la llave primaria.
  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  document!: string | null;

  @Column({ length: 100 })
  name!: string;

  // El correo institucional es la identidad que llega en el token de Firebase.
  @Column({ unique: true, length: 254 })
  email!: string;

  @Column({ type: 'integer', nullable: true })
  age!: number | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
