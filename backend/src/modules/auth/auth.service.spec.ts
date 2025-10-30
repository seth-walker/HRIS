import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { RoleName } from '../../entities/role.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUsersRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        isActive: true,
        role: { name: RoleName.EMPLOYEE },
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        isActive: true,
        role: { name: RoleName.EMPLOYEE },
      });
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['role'],
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        isActive: true,
        role: { name: RoleName.EMPLOYEE },
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        isActive: false,
        role: { name: RoleName.EMPLOYEE },
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return JWT token and user info', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: { name: RoleName.EMPLOYEE },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(mockUser as any);

      expect(result.access_token).toEqual('jwt-token');
      expect(result.user.id).toEqual('1');
      expect(result.user.email).toEqual('test@example.com');
      expect(result.user.role).toEqual({ name: RoleName.EMPLOYEE });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: '1',
        role: RoleName.EMPLOYEE,
      });
    });
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const mockUser = {
        id: '1',
        email: 'new@example.com',
        passwordHash: 'hashedPassword',
        roleId: 'role-123',
      };

      mockUsersRepository.findOne.mockResolvedValue(null);
      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register(
        'new@example.com',
        'password',
        'role-123',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        passwordHash: 'hashedPassword',
        roleId: 'role-123',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'existing@example.com',
      };

      mockUsersRepository.findOne.mockResolvedValue(existingUser);

      await expect(
        service.register('existing@example.com', 'password', 'role-123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
