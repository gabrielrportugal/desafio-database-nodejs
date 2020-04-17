import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const checkBalance = await transactionRepository.getBalance();

    if (type === 'outcome' && checkBalance.total <= value) {
      throw new AppError('Insufficient funds', 400);
    }

    const createCategory = new CreateCategoryService();

    const categoryObject = await createCategory.execute(category);

    const transaction = transactionRepository.create({
      title,
      value,
      category_id: categoryObject.id,
      type,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
