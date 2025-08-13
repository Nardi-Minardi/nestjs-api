import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async countByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<number> {
    return this.prismaService.user.count({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({ data });
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { last_login: new Date() },
    });
  }

  async findAllWithPagination(
    search: string | undefined,
    page: number,
    limit: number,
    orderBy: string | undefined = 'created_at',
    orderDirection: 'asc' | 'desc' = 'desc',
    filters?: Array<{ field: string; value: string }>,
  ): Promise<User[]> {
    const where: any = {};

    // Search logic
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { fullname: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters logic => OR + contains field specific di definisikan
    const stringFields = ['email', 'username', 'fullname'];
    const enumFields = ['role'];

    if (filters && filters.length > 0) {
      const filterConditions = filters.map((f) => {
        if (stringFields.includes(f.field)) {
          return { [f.field]: { contains: f.value, mode: 'insensitive' } };
        } else if (enumFields.includes(f.field)) {
          return { [f.field]: { equals: f.value } };
        }
        return {};
      });

      if (where.OR) {
        where.OR = [...where.OR, ...filterConditions];
      } else {
        where.OR = filterConditions;
      }
    }

    return this.prismaService.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [orderBy || 'created_at']: orderDirection,
      },
    });
  }

  async countSearch(search: string | undefined): Promise<number> {
    let where;
    if (search)
      where = {
        OR: [
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            username: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            fullname: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };
    else where = {};

    return this.prismaService.user.count({ where });
  }

  async findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  async countById(id: string): Promise<number> {
    return this.prismaService.user.count({ where: { id } });
  }

  async countByEmail(id: string, email: string): Promise<number> {
    return this.prismaService.user.count({
      where: { NOT: { id }, email },
    });
  }

  async countByUsername(id: string, username: string): Promise<number> {
    return this.prismaService.user.count({
      where: { NOT: { id }, username },
    });
  }

  async updateById(id: string, data: Partial<User>): Promise<User> {
    return this.prismaService.user.update({ where: { id }, data });
  }
}
