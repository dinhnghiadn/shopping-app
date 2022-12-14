import { User } from '../../models/entities/User.entity';
import { EntityManager, Repository } from 'typeorm';
import { SignUp } from '../../models/dto/sign-up';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import {
  sendNewPasswordEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from '../../utils/common/email';
import { Owner, UserStatus } from '../../utils/common/enum';
import {
  ErrorResponse,
  isSuccessResponse,
  SuccessResponse,
} from '../../utils/common/interfaces';
import { SignIn } from '../../models/dto/sign-in';
import * as bcrypt from 'bcrypt';
import { ForgotPassword } from '../../models/dto/forgot-password';
import * as crypto from 'crypto';
import { Profile } from '../../models/entities/Profile.entity';
import { plainToInstance } from 'class-transformer';
import { deleteImage, uploadImage } from '../../utils/common/images';
import { Image } from '../../models/entities/Image.entity';
import { Order } from '../../models/entities/Order.entity';

const { HOST, PORT, JWT_VERIFY, JWT_RESET, JWT_SECRET } = process.env;

export class UserService {
  constructor(
    public userRepository: Repository<User>,
    public imageRepository: Repository<Image>,
    public orderRepository: Repository<Order>,
    private readonly entityManager: EntityManager
  ) {}

  async createUser(data: SignUp): Promise<User> {
    const user = this.userRepository.create(data);
    user.lastLogin = new Date();
    return await this.userRepository.save(user);
  }

  async findOne(input: string, property: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where(`user.${property} = :input`, { input: input })
      .getOne();
  }

  async signUp(data: SignUp): Promise<SuccessResponse | ErrorResponse> {
    try {
      const duplicateUsername = await this.findOne(data.username, 'username');
      if (duplicateUsername !== null) {
        return {
          success: false,
          status: 400,
          message: 'Username has been taken!',
        };
      }

      const duplicateEmail = await this.findOne(data.email, 'email');
      if (duplicateEmail !== null) {
        return {
          success: false,
          status: 400,
          message: 'Email has been taken!',
        };
      }
      const createdUser = await this.createUser(data);
      const payload = { email: data.email, created: new Date().toString() };
      const verifyToken = jwt.sign(payload, process.env.JWT_VERIFY as string, {
        expiresIn: '1d',
      });
      const verifyUrl = `http://${HOST as string}:${
        PORT as string
      }/user/verify?token=${verifyToken}`;
      await sendVerificationEmail(data.email, verifyUrl);
      return {
        success: true,
        status: 201,
        message: 'Create user successfully!',
        resource: createdUser,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async verify(token: string): Promise<SuccessResponse | ErrorResponse> {
    try {
      const decode = jwt.verify(token, JWT_VERIFY as string);
      const email = (decode as JwtPayload).email;
      const user = await this.userRepository.findOne({ where: { email } });
      if (user === null) {
        return {
          success: false,
          status: 404,
          message: 'User not found!',
        };
      }
      if (user.status === UserStatus.Active) {
        return {
          success: false,
          status: 400,
          message: 'User has already verified!',
        };
      }
      user.status = UserStatus.Active;
      const verifiedUser = await this.userRepository.save(user);
      const payload = { username: user.username, sub: user.id };
      const accessToken = jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: '7d',
      });
      return {
        success: true,
        status: 200,
        message: 'Verify user successfully!',
        resource: verifiedUser,
        token: accessToken,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async login(data: SignIn): Promise<SuccessResponse | ErrorResponse> {
    try {
      let user = await this.findOne(data.username, 'username');
      if (user === null) {
        return {
          success: false,
          status: 400,
          message: 'User not found ',
        };
      }
      switch (user.status) {
        case UserStatus.NotVerified:
          return {
            success: false,
            status: 400,
            message: 'User are not verified yet!',
          };
        case UserStatus.Blocked:
          return {
            success: false,
            status: 400,
            message: 'You are blocked. Contact' + ' admin for more information!',
          };
      }
      const result = await bcrypt.compare(data.password, user.password);
      if (!result) {
        return {
          success: false,
          status: 401,
          message: 'Wrong password. Please try again!',
        };
      }

      const payload = { username: user.username, sub: user.id };
      const accessToken = jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: '7d',
      });
      user.lastLogin = new Date();
      user.status = UserStatus.Active;
      user = await this.userRepository.save(user);
      return {
        success: true,
        status: 200,
        message: 'Login successfully!',
        resource: user,
        token: accessToken,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async forgotPassword(body: ForgotPassword): Promise<SuccessResponse | ErrorResponse> {
    try {
      const user = await this.findOne(body.email, 'email');
      if (user === null) {
        return {
          success: false,
          status: 400,
          message: 'There are no user with this email!',
        };
      }
      const payload = { email: user.email, created: new Date().toString() };
      const resetToken = jwt.sign(payload, process.env.JWT_RESET as string, {
        expiresIn: 60 * 3,
      });
      user.resetToken = resetToken;
      await this.userRepository.save(user);
      const resetUrl = `http://${HOST as string}:${
        PORT as string
      }/user/reset?token=${resetToken}`;
      await sendResetPasswordEmail(user.email, resetUrl);
      return {
        success: true,
        status: 200,
        message: 'Check your email for password reset!',
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async reset(token: string): Promise<SuccessResponse | ErrorResponse> {
    try {
      const decode = jwt.verify(token, JWT_RESET as string);
      const email = (decode as JwtPayload).email;
      const user = await this.userRepository.findOne({ where: { email } });
      if (user == null) {
        return {
          success: false,
          status: 404,
          message: 'User not found!',
        };
      }
      if (user.resetToken !== token) {
        return {
          success: false,
          status: 401,
          message: 'Invalid token!',
        };
      }
      const newPassword = crypto.randomBytes(12).toString('hex');
      user.password = newPassword;
      await this.userRepository.save(user);
      await sendNewPasswordEmail(user.email, newPassword);
      return {
        success: true,
        status: 200,
        message: 'A new password has sent to your email. Please' + ' check it!',
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async viewProfile(user: User): Promise<SuccessResponse | ErrorResponse> {
    return {
      success: true,
      status: 200,
      resource: user.profile,
    };
  }

  async addProfile(data: Profile, user: User): Promise<SuccessResponse | ErrorResponse> {
    try {
      const profileData = plainToInstance(Profile, data);
      if (user.profile !== undefined) {
        user.profile = Object.assign(user.profile, profileData);
      } else user.profile = plainToInstance(Profile, data);
      await this.userRepository.save(user);
      return {
        success: true,
        status: 200,
        message: 'Edit profile successfully !',
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async getAvatar(user: User): Promise<SuccessResponse | ErrorResponse> {
    try {
      const existAvatar = await this.imageRepository.findOne({
        where: {
          belongTo: Owner.User,
          ownerId: user.id,
        },
      });
      if (existAvatar == null) {
        return {
          success: false,
          status: 404,
          message: 'Avatar not found!',
        };
      }
      return {
        success: true,
        status: 200,
        message: 'Get avatar of user successfully !',
        resource: existAvatar,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async uploadAvatar(
    file: Express.Multer.File,
    user: User
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const uploadResult = await uploadImage(file, 'users');
      if (isSuccessResponse(uploadResult)) {
        const imageUrl: string = uploadResult.resource as string;
        const existImage = await this.imageRepository.findOne({
          where: {
            belongTo: Owner.User,
            ownerId: user.id,
          },
        });
        if (existImage !== null) {
          await deleteImage(existImage.url);
          existImage.url = imageUrl;
          await this.imageRepository.save(existImage);
        } else {
          const image = this.imageRepository.create({
            url: imageUrl,
            belongTo: Owner.User,
            ownerId: user.id,
          });
          await this.imageRepository.save(image);
        }
      }
      return uploadResult;
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async getAllOrders(
    user: User,
    orderBy?: string
  ): Promise<SuccessResponse | ErrorResponse> {
    const listOrder = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.products', 'product')
      .where('order.userId = :id', { id: user.id })
      .orderBy(orderBy ? `order.${orderBy}` : 'TRUE', 'DESC')
      .getMany();
    if (listOrder.length === 0) {
      return {
        success: true,
        status: 200,
        message: 'Order list is empty!',
      };
    }
    return {
      success: true,
      status: 200,
      message: 'Get list order successfully!',
      resources: listOrder,
    };
  }

  async getOrderDetail(user: User, id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const order = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.products', 'orderProduct')
        .leftJoinAndSelect('orderProduct.product', 'product')
        .leftJoinAndMapOne(
          'product.thumbnail',
          Image,
          'image',
          'product.id =' +
            ' image.ownerId and image.belongTo = :owner and' +
            ' image.primary = :primary',
          { owner: Owner.Product, primary: true }
        )
        .where('order.id = :id', { id: id })
        .andWhere('user.id = :userId', { userId: user.id })
        .getOne();
      if (order === null) {
        return {
          success: false,
          status: 404,
          message: 'Order not found!',
        };
      }

      return {
        success: true,
        status: 200,
        message: 'Get Order detail successfully!',
        resource: order,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }
}
