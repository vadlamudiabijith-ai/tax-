import { createHash } from 'crypto';

export interface Block {
  index: number;
  timestamp: number;
  data: TransactionData;
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface TransactionData {
  transactionId: string;
  userId: string;
  type: 'tax_payment' | 'crowdfunding' | 'donation';
  amount: number;
  category?: string;
  campaignId?: string;
  metadata?: Record<string, any>;
}

export class BlockchainService {
  private difficulty: number = 4;

  calculateHash(
    index: number,
    timestamp: number,
    data: TransactionData,
    previousHash: string,
    nonce: number
  ): string {
    const content = `${index}${timestamp}${JSON.stringify(data)}${previousHash}${nonce}`;

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(content);

      return window.crypto.subtle.digest('SHA-256', dataBuffer).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }).catch(() => {
        return this.fallbackHash(content);
      }) as any;
    }

    return this.fallbackHash(content);
  }

  private fallbackHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  async mineBlock(
    index: number,
    timestamp: number,
    data: TransactionData,
    previousHash: string
  ): Promise<Block> {
    let nonce = 0;
    let hash = '';

    do {
      nonce++;
      hash = await this.calculateHash(index, timestamp, data, previousHash, nonce);
    } while (!hash.startsWith('0'.repeat(this.difficulty)));

    return {
      index,
      timestamp,
      data,
      previousHash,
      hash,
      nonce
    };
  }

  async createBlock(data: TransactionData, previousHash: string, index: number): Promise<Block> {
    const timestamp = Date.now();
    return await this.mineBlock(index, timestamp, data, previousHash);
  }

  async verifyBlock(block: Block, previousBlock: Block | null): Promise<boolean> {
    if (previousBlock && block.previousHash !== previousBlock.hash) {
      return false;
    }

    const calculatedHash = await this.calculateHash(
      block.index,
      block.timestamp,
      block.data,
      block.previousHash,
      block.nonce
    );

    if (calculatedHash !== block.hash) {
      return false;
    }

    if (!block.hash.startsWith('0'.repeat(this.difficulty))) {
      return false;
    }

    return true;
  }

  async verifyChain(blocks: Block[]): Promise<boolean> {
    for (let i = 1; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const previousBlock = blocks[i - 1];

      const isValid = await this.verifyBlock(currentBlock, previousBlock);
      if (!isValid) {
        return false;
      }
    }

    return true;
  }

  generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN-${timestamp}-${random}`.toUpperCase();
  }

  formatBlockHash(hash: string): string {
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  }

  async getBlockchainStats(blocks: Block[]) {
    const totalTransactions = blocks.length;
    const totalAmount = blocks.reduce((sum, block) => sum + block.data.amount, 0);
    const isValid = await this.verifyChain(blocks);

    const typeBreakdown = blocks.reduce((acc, block) => {
      const type = block.data.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTransactions,
      totalAmount,
      isValid,
      typeBreakdown,
      latestBlock: blocks.length > 0 ? blocks[blocks.length - 1] : null
    };
  }
}

export const blockchain = new BlockchainService();
