import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from "@nestjs/common";
import { ApiExcludeEndpoint, ApiTags } from "@nestjs/swagger";
import { AuthService } from "src/common/auth/services/auth.service";
import { Response } from "src/common/response/decorators/response.decorator";
import { IResponse } from "src/common/response/interfaces/response.interface";
import { ENUM_USER_STATUS_CODE_ERROR } from "../constants/user.status-code.constant";
import { ENUM_ROLE_STATUS_CODE_ERROR } from "src/modules/role/constants/role.status-code.constant";
import { UserService } from "../services/user.service";
import { SettingService } from "src/common/setting/services/setting.service";
import { UserLoginSerialization } from "../serializations/user.login.serialization";
import { UserLoginDto } from "../dtos/user.login.dto";
import { UserEntity } from "../repository/entities/user.entity";
import { ENUM_AUTH_LOGIN_WITH } from "src/common/auth/constants/auth.enum.constant";
import { UserPublicLoginDoc, UserPublicSignUpDoc } from "../docs/user.public.doc";
import { UserSignUpDto } from "../dtos/user.signup.dto-";
import { RoleService } from "src/modules/role/services/role.service";
import { ENUM_USER_SIGN_UP_FROM } from "../constants/user.enum.constant";
import { IAuthGooglePayload, IAuthPassword } from "src/common/auth/interfaces/auth.interface";
import { ENUM_ERROR_STATUS_CODE_ERROR } from "src/common/error/constants/error.status-code.constant";
import {
  AuthGoogleOAuth2LoginProtected,
  AuthGoogleOAuth2SignUpProtected,
} from "src/common/auth/decorators/auth.google.decorator";
import { AuthJwtPayload } from "src/common/auth/decorators/auth.jwt.decorator";

@ApiTags("modules.public.user")
@Controller({
  version: "1",
  path: "/user",
})
export class UserPublicController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly authService: AuthService,
    private readonly settingService: SettingService,
  ) {}

  @UserPublicLoginDoc()
  @Response("user.login", {
    serialization: UserLoginSerialization,
  })
  @HttpCode(HttpStatus.OK)
  @Post("/login")
  async login(@Body() { email, password }: UserLoginDto): Promise<IResponse> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
        message: "user.error.notFound",
      });
    }

    const [passwordAttempt, maxPasswordAttempt] = await Promise.all([
      this.settingService.getPasswordAttempt(),
      this.settingService.getMaxPasswordAttempt(),
    ]);

    if (passwordAttempt && user.passwordAttempt >= maxPasswordAttempt) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_ATTEMPT_MAX_ERROR,
        message: "user.error.passwordAttemptMax",
      });
    }

    const validate: boolean = await this.authService.validateUser(password, user.password);
    if (!validate) {
      await this.userService.increasePasswordAttempt(user);
      throw new BadRequestException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NOT_MATCH_ERROR,
        message: "user.error.passwordNotMatch",
      });
    }

    switch (true) {
      case user.blocked:
        throw new ForbiddenException({
          statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_BLOCKED_ERROR,
          message: "user.error.blocked",
        });
      case user.inactivePermanent:
        throw new ForbiddenException({
          statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_PERMANENT_ERROR,
          message: "user.error.inactivePermanent",
        });
      case !user.isActive:
        throw new ForbiddenException({
          statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_ERROR,
          message: "user.error.inactive",
        });
    }

    const userWithRole: UserEntity = await this.userService.joinWithRole(user.id);
    if (!userWithRole.role.isActive) {
      throw new ForbiddenException({
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR,
        message: "role.error.inactive",
      });
    }

    await this.userService.resetPasswordAttempt(user);

    const [payload, tokenType, expiresIn] = await Promise.all([
      this.userService.payloadSerialization(userWithRole),
      this.authService.getTokenType(),
      this.authService.getAccessTokenExpirationTime(),
    ]);

    const [payloadAccessToken, payloadRefreshToken, payloadEncryption] = await Promise.all([
      this.authService.createPayloadAccessToken(payload),
      this.authService.createPayloadRefreshToken(payload.id, {
        loginWith: ENUM_AUTH_LOGIN_WITH.LOCAL,
      }),
      this.authService.getPayloadEncryption(),
    ]);

    let payloadHashedAccessToken: Record<string, any> | string = payloadAccessToken;
    let payloadHashedRefreshToken: Record<string, any> | string = payloadRefreshToken;

    if (payloadEncryption) {
      payloadHashedAccessToken = await this.authService.encryptAccessToken(payloadAccessToken);
      payloadHashedRefreshToken = await this.authService.encryptRefreshToken(payloadRefreshToken);
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.authService.createAccessToken(payloadHashedAccessToken),
      this.authService.createRefreshToken(payloadHashedRefreshToken),
    ]);

    return {
      data: {
        tokenType,
        expiresIn,
        accessToken,
        refreshToken,
      },
    };
  }

  @UserPublicSignUpDoc()
  @Response("user.signUp")
  @Post("/sign-up")
  async signUp(
    @Body()
    { email, mobileNumber, ...body }: UserSignUpDto,
  ): Promise<void> {
    const [role, emailExist] = await Promise.all([
      this.roleService.findOneByName("user"),
      this.userService.existByEmail(email),
    ]);
    if (mobileNumber) {
      const mobileNumberExist = await this.userService.existByMobileNumber(mobileNumber);
      if (mobileNumberExist) {
        throw new ConflictException({
          statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_MOBILE_NUMBER_EXIST_ERROR,
          message: "user.error.mobileNumberExist",
        });
      }
    }

    if (!role) {
      throw new BadRequestException({
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
        message: "role.error.notFound",
      });
    } else if (emailExist) {
      throw new ConflictException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EMAIL_EXIST_ERROR,
        message: "user.error.emailExist",
      });
    }
    const password: IAuthPassword = await this.authService.createPassword(body.password);

    await this.userService.create(
      {
        email,
        mobileNumber,
        signUpFrom: ENUM_USER_SIGN_UP_FROM.LOCAL,
        role,
        ...body,
      },
      password,
    );

    return;
  }

  @ApiExcludeEndpoint()
  @Response("user.loginGoogle")
  @AuthGoogleOAuth2LoginProtected()
  @Get("/login/google")
  async loginGoogle(): Promise<void> {
    return;
  }

  @ApiExcludeEndpoint()
  @Response("user.loginGoogleCallback")
  @AuthGoogleOAuth2LoginProtected()
  @Get("/login/google/callback")
  async loginGoogleCallback(
    @AuthJwtPayload()
    { email, accessToken: googleAccessToken, refreshToken: googleRefreshToken }: IAuthGooglePayload,
  ): Promise<IResponse> {
    const user: UserEntity = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
        message: "user.error.notFound",
      });
    } else if (user.blocked) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_BLOCKED_ERROR,
        message: "user.error.blocked",
      });
    } else if (user.inactivePermanent) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_PERMANENT_ERROR,
        message: "user.error.inactivePermanent",
      });
    } else if (!user.isActive) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_ERROR,
        message: "user.error.inactive",
      });
    }

    const userWithRole: UserEntity = await this.userService.joinWithRole(user.id);
    if (!userWithRole.role.isActive) {
      throw new ForbiddenException({
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR,
        message: "role.error.inactive",
      });
    }

    await this.userService.updateGoogleSSO(user, {
      accessToken: googleAccessToken,
      refreshToken: googleRefreshToken,
    });

    const payload = await this.userService.payloadSerialization(userWithRole);
    const tokenType: string = await this.authService.getTokenType();
    const expiresIn: number = await this.authService.getAccessTokenExpirationTime();
    const payloadAccessToken: Record<string, any> = await this.authService.createPayloadAccessToken(
      payload,
    );
    const payloadRefreshToken: Record<string, any> =
      await this.authService.createPayloadRefreshToken(payload.id, {
        loginWith: ENUM_AUTH_LOGIN_WITH.GOOGLE,
      });

    const payloadEncryption = await this.authService.getPayloadEncryption();
    let payloadHashedAccessToken: Record<string, any> | string = payloadAccessToken;
    let payloadHashedRefreshToken: Record<string, any> | string = payloadRefreshToken;

    if (payloadEncryption) {
      payloadHashedAccessToken = await this.authService.encryptAccessToken(payloadAccessToken);
      payloadHashedRefreshToken = await this.authService.encryptRefreshToken(payloadRefreshToken);
    }

    const accessToken: string = await this.authService.createAccessToken(payloadHashedAccessToken);

    const refreshToken: string = await this.authService.createRefreshToken(
      payloadHashedRefreshToken,
    );

    return {
      data: {
        tokenType,
        expiresIn,
        accessToken,
        refreshToken,
      },
    };
  }

  @ApiExcludeEndpoint()
  @Response("user.signUpGoogle")
  @AuthGoogleOAuth2SignUpProtected()
  @Get("/sign-up/google")
  async signUpGoogle(): Promise<void> {
    return;
  }

  @ApiExcludeEndpoint()
  @Response("user.signUpGoogleCallback")
  @AuthGoogleOAuth2SignUpProtected()
  @HttpCode(HttpStatus.CREATED)
  @Get("/sign-up/google/callback")
  async signUpGoogleCallback(
    @AuthJwtPayload()
    {
      email,
      firstName,
      lastName,
      accessToken: googleAccessToken,
      refreshToken: googleRefreshToken,
    }: IAuthGooglePayload,
  ): Promise<void> {
    const [role, emailExist] = await Promise.all([
      this.roleService.findOneByName("user"),
      this.userService.existByEmail(email),
    ]);

    if (emailExist) {
      throw new ConflictException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EMAIL_EXIST_ERROR,
        message: "user.error.emailExist",
      });
    }

    try {
      const passwordString = await this.authService.createPasswordRandom();
      const password = await this.authService.createPassword(passwordString);

      const user: UserEntity = await this.userService.create(
        {
          email,
          firstName,
          lastName,
          role: role,
          signUpFrom: ENUM_USER_SIGN_UP_FROM.GOOGLE,
        },
        password,
      );

      await this.userService.updateGoogleSSO(user, {
        accessToken: googleAccessToken,
        refreshToken: googleRefreshToken,
      });
    } catch (err: any) {
      throw new InternalServerErrorException({
        statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
        message: "http.serverError.internalServerError",
        _error: err.message,
      });
    }

    return;
  }
}
