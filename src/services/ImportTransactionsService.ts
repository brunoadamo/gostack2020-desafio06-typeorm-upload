import path from 'path';
import fs from 'fs';
import csv from 'csvtojson';

import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  importFilename: string;
}

class ImportTransactionsService {
  async execute({ importFilename }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const importFile = path.join(uploadConfig.directory, importFilename);

    const csvJson = await csv().fromFile(importFile);

    await fs.promises.unlink(importFile);

    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const item of csvJson) {
      const { title, type, value, category } = item;

      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransactionService.execute({
        title,
        type,
        value: Number.parseFloat(value),
        category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
