/**
 * Legacy schema kept only as a compatibility layer after migrating the
 * users module to the Hexagonal directory structure.
 */
export { FollowModel as Follow, FollowSchema } from '../infrastructure/database/mongodb/models/follow.model';
export type { FollowDocument } from '../infrastructure/database/mongodb/models/follow.model';
