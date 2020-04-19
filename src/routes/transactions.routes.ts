/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */

import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import AppError from '../errors/AppError';
import uploadConfig from '../config/uploadConfig';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find({
    // Relations serve para pegar um objeto da relação
    relations: ['category'],
  });

  transactions.map(transaction => {
    delete transaction.created_at;
    delete transaction.updated_at;
    delete transaction.category_id;
    delete transaction.category.created_at;
    delete transaction.category.updated_at;
  });

  const balance = await transactionsRepository.getBalance();

  return response.status(200).json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  if (type !== 'outcome' && type !== 'income') {
    throw new AppError('Type of transaction is invalid', 401);
  }

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    category,
    type,
    value,
  });

  return response.status(200).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute(request.file.path);

    return response.status(200).json(transactions);
  },
);

export default transactionsRouter;
