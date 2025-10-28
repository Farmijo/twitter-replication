/**
 * Legacy schema kept only as a compatibility layer after migrating the
 * users module to the Hexagonal directory structure.
 */
export { UserModel as User, UserSchema } from '../infrastructure/database/mongodb/models/user.model';
export type { UserDocument } from '../infrastructure/database/mongodb/models/user.model';
export { UserRole } from '../domain/entities/user.entity';