import { 
  type Product, 
  type InsertProduct,
  type InventoryTransaction,
  type InsertInventoryTransaction,
  type VoiceCommand,
  type InsertVoiceCommand,
  type DailyKpi,
  type InsertDailyKpi
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByCode(code: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  updateProductStock(id: string, newStock: number): Promise<Product | undefined>;
  
  // Transactions
  getTransactions(limit?: number): Promise<InventoryTransaction[]>;
  createTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  
  // Voice Commands
  createVoiceCommand(command: InsertVoiceCommand): Promise<VoiceCommand>;
  
  // KPIs
  getTodayKpis(): Promise<DailyKpi | undefined>;
  updateTodayKpis(updates: Partial<DailyKpi>): Promise<DailyKpi>;
  
  // Analytics
  getLowStockProducts(): Promise<Product[]>;
  getCategoryBreakdown(): Promise<{ category: string; count: number; percentage: number }[]>;
  getWeeklyInventoryTrend(): Promise<{ date: string; totalStock: number }[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product> = new Map();
  private transactions: InventoryTransaction[] = [];
  private voiceCommands: VoiceCommand[] = [];
  private dailyKpis: Map<string, DailyKpi> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample products
    const sampleProducts: Product[] = [
      {
        id: "1",
        name: "iPhone 14 Pro",
        code: "IPH14P-256",
        category: "電子機器",
        currentStock: 8,
        minStock: 50,
        maxStock: 500,
        unit: "個",
        location: "A区域",
        lastUpdated: new Date(),
      },
      {
        id: "2", 
        name: "カジュアルTシャツ M",
        code: "TSH-CAS-M",
        category: "衣料品",
        currentStock: 23,
        minStock: 30,
        maxStock: 200,
        unit: "個",
        location: "B区域",
        lastUpdated: new Date(),
      },
      {
        id: "3",
        name: "有機コーヒー豆",
        code: "COF-ORG-500",
        category: "食品",
        currentStock: 150,
        minStock: 20,
        maxStock: 300,
        unit: "個",
        location: "C区域", 
        lastUpdated: new Date(),
      },
      {
        id: "4",
        name: "ワイヤレスイヤホン",
        code: "WE-BT-001",
        category: "電子機器",
        currentStock: 75,
        minStock: 25,
        maxStock: 200,
        unit: "個",
        location: "A区域",
        lastUpdated: new Date(),
      },
      {
        id: "5",
        name: "ビジネススーツ L",
        code: "SUIT-BIZ-L",
        category: "衣料品", 
        currentStock: 45,
        minStock: 15,
        maxStock: 100,
        unit: "個",
        location: "B区域",
        lastUpdated: new Date(),
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });

    // Initialize today's KPIs
    const today = new Date().toISOString().split('T')[0];
    const todayKpis: DailyKpi = {
      id: randomUUID(),
      date: today,
      totalInbound: 1247,
      totalOutbound: 986,
      lowStockAlerts: 2,
      voiceCommandsUsed: 45,
    };
    this.dailyKpis.set(today, todayKpis);
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByCode(code: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.code === code);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      lastUpdated: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates, lastUpdated: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async updateProductStock(id: string, newStock: number): Promise<Product | undefined> {
    return this.updateProduct(id, { currentStock: newStock });
  }

  async getTransactions(limit = 50): Promise<InventoryTransaction[]> {
    return this.transactions
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createTransaction(insertTransaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const id = randomUUID();
    const transaction: InventoryTransaction = {
      ...insertTransaction,
      id,
      timestamp: new Date(),
    };
    this.transactions.push(transaction);
    
    // Update today's KPIs
    const today = new Date().toISOString().split('T')[0];
    const todayKpis = this.dailyKpis.get(today);
    if (todayKpis) {
      if (transaction.type === 'inbound') {
        todayKpis.totalInbound += transaction.quantity;
      } else if (transaction.type === 'outbound') {
        todayKpis.totalOutbound += transaction.quantity;
      }
      this.dailyKpis.set(today, todayKpis);
    }
    
    return transaction;
  }

  async createVoiceCommand(insertCommand: InsertVoiceCommand): Promise<VoiceCommand> {
    const id = randomUUID();
    const command: VoiceCommand = {
      ...insertCommand,
      id,
      timestamp: new Date(),
    };
    this.voiceCommands.push(command);
    
    // Update voice commands count for today
    const today = new Date().toISOString().split('T')[0];
    const todayKpis = this.dailyKpis.get(today);
    if (todayKpis) {
      todayKpis.voiceCommandsUsed += 1;
      this.dailyKpis.set(today, todayKpis);
    }
    
    return command;
  }

  async getTodayKpis(): Promise<DailyKpi | undefined> {
    const today = new Date().toISOString().split('T')[0];
    return this.dailyKpis.get(today);
  }

  async updateTodayKpis(updates: Partial<DailyKpi>): Promise<DailyKpi> {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.dailyKpis.get(today);
    
    const kpis: DailyKpi = existing ? 
      { ...existing, ...updates } : 
      {
        id: randomUUID(),
        date: today,
        totalInbound: 0,
        totalOutbound: 0,
        lowStockAlerts: 0,
        voiceCommandsUsed: 0,
        ...updates
      };
    
    this.dailyKpis.set(today, kpis);
    return kpis;
  }

  async getLowStockProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.currentStock <= p.minStock);
  }

  async getCategoryBreakdown(): Promise<{ category: string; count: number; percentage: number }[]> {
    const products = Array.from(this.products.values());
    const totalProducts = products.length;
    
    const categoryMap = new Map<string, number>();
    products.forEach(p => {
      categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
    });
    
    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalProducts) * 100)
    }));
  }

  async getWeeklyInventoryTrend(): Promise<{ date: string; totalStock: number }[]> {
    // Generate sample weekly data
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    const products = Array.from(this.products.values());
    const baseTotal = products.reduce((sum, p) => sum + p.currentStock, 0);
    
    return dates.map((date, index) => ({
      date,
      totalStock: baseTotal + Math.floor(Math.random() * 200) - 100
    }));
  }
}

export const storage = new MemStorage();
