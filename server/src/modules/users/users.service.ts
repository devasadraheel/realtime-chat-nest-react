import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUser, UpdateUser } from '../../common/schemas';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUser): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findBySub(sub: string): Promise<User | null> {
    return this.userModel.findOne({ sub }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateUserDto: UpdateUser): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async upsertBySub(sub: string, userData: Partial<CreateUser>): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { sub },
      { ...userData, sub },
      { upsert: true, new: true }
    ).exec();
  }

  async search(query: string, limit: number = 20): Promise<User[]> {
    return this.userModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
      .limit(limit)
      .exec();
  }

  async updateStatus(id: string, status: 'online' | 'offline' | 'away', lastSeen?: Date): Promise<User | null> {
    const updateData: any = { status };
    if (lastSeen) {
      updateData.lastSeen = lastSeen;
    }
    
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}
