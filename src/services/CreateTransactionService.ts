import { getCustomRepository, getRepository, TransactionRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string
}

class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();
    if(type == 'outcome' && balance.total < value  ){
      throw new AppError('should not be able to create outcome transaction without a valid balance');
    }

    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category
      },
    })

    if(!transactionCategory){
      transactionCategory = categoryRepository.create({
        title: category
      })

      await categoryRepository.save(transactionCategory);
    }

    const newTransaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
