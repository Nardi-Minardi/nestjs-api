import { Pagination } from 'src/common/web-response';
import { UserDto } from './user.dto';

export class GetUserRequestPaginationDto {
  search?: string;
  page: string;
  limit: string;
}

export class GetUserResponsePaginationDto {
  data: UserDto[];
  pagination: Pagination;
}

export class GetUserRequestDto {
  userId: string;
}

export class GetUserResponseDto extends UserDto {}
