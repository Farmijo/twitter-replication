export const USERS_TOKENS = {
  UserRepository: 'UserRepository',
  FollowRepository: 'FollowRepository',
  // Command Use Cases
  CreateUserUseCase: 'CreateUserUseCase',
  UpdateUserUseCase: 'UpdateUserUseCase',
  DeleteUserUseCase: 'DeleteUserUseCase',
  FollowUserUseCase: 'FollowUserUseCase',
  UnfollowUserUseCase: 'UnfollowUserUseCase',
  // Query Use Cases
  GetUserByIdUseCase: 'GetUserByIdUseCase',
  GetUsersUseCase: 'GetUsersUseCase',
  GetUserByUsernameUseCase: 'GetUserByUsernameUseCase',
  GetUserByEmailUseCase: 'GetUserByEmailUseCase',
  GetFollowersUseCase: 'GetFollowersUseCase',
  GetFollowingUseCase: 'GetFollowingUseCase',
  IsFollowingUseCase: 'IsFollowingUseCase',
  GetUserStatsUseCase: 'GetUserStatsUseCase',
} as const;
