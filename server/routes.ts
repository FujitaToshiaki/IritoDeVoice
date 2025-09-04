import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTransactionSchema, insertVoiceCommandSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedClients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      connectedClients.delete(ws);
      console.log('WebSocket client disconnected');
    });
    
    // Send initial data
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to IritoDeVoice real-time updates'
    }));
  });

  function broadcastUpdate(type: string, data: any) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    connectedClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // API Routes
  
  // Get dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const [products, kpis, lowStockProducts, categoryBreakdown, weeklyTrend, recentTransactions] = await Promise.all([
        storage.getProducts(),
        storage.getTodayKpis(),
        storage.getLowStockProducts(),
        storage.getCategoryBreakdown(),
        storage.getWeeklyInventoryTrend(),
        storage.getTransactions(10)
      ]);

      res.json({
        products,
        kpis,
        lowStockProducts,
        categoryBreakdown,
        weeklyTrend,
        recentTransactions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get products by location
  app.get("/api/locations/:location/products", async (req, res) => {
    try {
      const products = await storage.getProductsByLocation(req.params.location);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products for location" });
    }
  });

  // Get list of locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json({ locations });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  // Get product by code
  app.get("/api/products/code/:code", async (req, res) => {
    try {
      const product = await storage.getProductByCode(req.params.code);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Create inventory transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Get the product and update stock
      const product = await storage.getProduct(validatedData.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Calculate new stock based on transaction type
      let newStock = product.currentStock;
      if (validatedData.type === 'inbound') {
        newStock += validatedData.quantity;
      } else if (validatedData.type === 'outbound') {
        newStock -= validatedData.quantity;
        if (newStock < 0) {
          return res.status(400).json({ error: "Insufficient stock" });
        }
      }

      // Create transaction with calculated values
      const transactionData = {
        ...validatedData,
        previousStock: product.currentStock,
        newStock
      };

      const transaction = await storage.createTransaction(transactionData);
      await storage.updateProductStock(validatedData.productId, newStock);

      // Broadcast real-time update
      broadcastUpdate('inventory_update', {
        productId: validatedData.productId,
        newStock,
        transaction
      });

      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create transaction" });
      }
    }
  });

  // Process voice command
  app.post("/api/voice-command", async (req, res) => {
    try {
      const { transcript, userId } = req.body;
      
      if (!transcript || !userId) {
        return res.status(400).json({ error: "Transcript and userId are required" });
      }

      // Process voice command
      const interpretation = await processVoiceCommand(transcript);
      
      const voiceCommand = await storage.createVoiceCommand({
        transcript,
        interpretation,
        successful: interpretation.success ? 1 : 0,
        userId
      });

      let result = null;
      if (interpretation.success && interpretation.action) {
        try {
          result = await executeVoiceAction(interpretation.action);
          
          // Broadcast voice command result
          broadcastUpdate('voice_command', {
            transcript,
            interpretation,
            result
          });
        } catch (actionError) {
          console.error('Voice action execution failed:', actionError);
        }
      }

      res.json({
        voiceCommand,
        interpretation,
        result
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process voice command" });
    }
  });

  // Get KPIs
  app.get("/api/kpis", async (req, res) => {
    try {
      const kpis = await storage.getTodayKpis();
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KPIs" });
    }
  });

  // Voice command processing function
  async function processVoiceCommand(transcript: string) {
    const lowerTranscript = transcript.toLowerCase();
    
    // Inventory check patterns
    if (lowerTranscript.includes('在庫') && lowerTranscript.includes('確認')) {
      const codeMatch = transcript.match(/([A-Z0-9\-]+)/);
      if (codeMatch) {
        return {
          success: true,
          action: {
            type: 'check_stock',
            productCode: codeMatch[1]
          },
          message: `商品${codeMatch[1]}の在庫を確認します`
        };
      }
    }
    
    // Inbound patterns
    if (lowerTranscript.includes('入荷') || lowerTranscript.includes('入庫')) {
      const codeMatch = transcript.match(/([A-Z0-9\-]+)/);
      const quantityMatch = transcript.match(/(\d+)個/);
      
      if (codeMatch && quantityMatch) {
        return {
          success: true,
          action: {
            type: 'inbound',
            productCode: codeMatch[1],
            quantity: parseInt(quantityMatch[1])
          },
          message: `商品${codeMatch[1]}を${quantityMatch[1]}個入荷登録します`
        };
      }
    }
    
    // Outbound patterns
    if (lowerTranscript.includes('出荷') || lowerTranscript.includes('出庫')) {
      const codeMatch = transcript.match(/([A-Z0-9\-]+)/);
      const quantityMatch = transcript.match(/(\d+)個/);
      
      if (codeMatch && quantityMatch) {
        return {
          success: true,
          action: {
            type: 'outbound',
            productCode: codeMatch[1],
            quantity: parseInt(quantityMatch[1])
          },
          message: `商品${codeMatch[1]}を${quantityMatch[1]}個出荷登録します`
        };
      }
    }

    return {
      success: false,
      message: "音声コマンドを理解できませんでした。もう一度お試しください。"
    };
  }

  // Execute voice action
  async function executeVoiceAction(action: any) {
    switch (action.type) {
      case 'check_stock':
        const product = await storage.getProductByCode(action.productCode);
        if (!product) {
          throw new Error("商品が見つかりません");
        }
        return {
          type: 'stock_check',
          product,
          message: `${product.name}の現在在庫は${product.currentStock}${product.unit}です`
        };
        
      case 'inbound':
      case 'outbound':
        const targetProduct = await storage.getProductByCode(action.productCode);
        if (!targetProduct) {
          throw new Error("商品が見つかりません");
        }
        
        const transactionResult = await storage.createTransaction({
          productId: targetProduct.id,
          type: action.type,
          quantity: action.quantity,
          previousStock: targetProduct.currentStock,
          newStock: action.type === 'inbound' 
            ? targetProduct.currentStock + action.quantity
            : targetProduct.currentStock - action.quantity,
          userId: 'voice_user',
          isVoiceCommand: 1,
          note: `音声コマンドによる${action.type === 'inbound' ? '入荷' : '出荷'}操作`
        });
        
        await storage.updateProductStock(
          targetProduct.id, 
          transactionResult.newStock
        );
        
        return {
          type: 'transaction',
          transaction: transactionResult,
          message: `${targetProduct.name}の${action.type === 'inbound' ? '入荷' : '出荷'}を完了しました`
        };
        
      default:
        throw new Error("Unknown action type");
    }
  }

  return httpServer;
}
