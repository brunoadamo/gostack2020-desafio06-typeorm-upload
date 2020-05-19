import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

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
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    let category_id = null;

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('You dont have enought money');
    }
    const checkCategory = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!checkCategory) {
      const categoryNew = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryNew);

      category_id = categoryNew.id;
    } else if (!category_id) category_id = checkCategory.id;

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
