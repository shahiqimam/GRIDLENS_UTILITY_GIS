import { UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { UserRole, UserStatus } from "../users/user.enums";
import { UsersService } from "../users/users.service";

const activeUser = {
  id: "user-1",
  email: "operations@gridlens.local",
  passwordHash: "",
  firstName: "Ops",
  lastName: "User",
  role: UserRole.Operations,
  status: UserStatus.Active,
  lastLoginAt: null,
  createdAt: new Date("2026-09-15T00:00:00.000Z"),
  updatedAt: new Date("2026-09-15T00:00:00.000Z")
};

describe("AuthService", () => {
  it("returns a JWT and user profile for valid credentials", async () => {
    const passwordHash = await bcrypt.hash("gridlens-demo", 10);
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue({ ...activeUser, passwordHash }),
      updateLastLogin: jest.fn().mockResolvedValue(undefined)
    };
    const jwtService = { signAsync: jest.fn().mockResolvedValue("signed-token") };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService }
      ]
    }).compile();

    const service = moduleRef.get(AuthService);
    const result = await service.login("OPERATIONS@GRIDLENS.LOCAL", "gridlens-demo");

    expect(result).toEqual({
      accessToken: "signed-token",
      user: { id: "user-1", email: "operations@gridlens.local", role: UserRole.Operations }
    });
    expect(usersService.updateLastLogin).toHaveBeenCalledWith("user-1", expect.any(Date));
  });

  it("rejects invalid credentials", async () => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      updateLastLogin: jest.fn()
    };
    const jwtService = { signAsync: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService }
      ]
    }).compile();

    const service = moduleRef.get(AuthService);
    await expect(service.login("missing@gridlens.local", "bad-password")).rejects.toThrow(UnauthorizedException);
  });
});
