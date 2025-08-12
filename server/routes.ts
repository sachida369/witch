import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { kundaliFormSchema, paymentVerificationSchema } from "@shared/schema";
import { createPaymentOrder, verifyPayment } from "./services/payment";
import { generateKundali } from "./services/kundali";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create payment order
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { amount, currency, description } = req.body;
      
      if (!amount || amount < 100) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const order = await createPaymentOrder(amount, currency || "INR", description);
      res.json(order);
    } catch (error) {
      console.error("Payment order creation error:", error);
      res.status(500).json({ error: "Failed to create payment order" });
    }
  });

  // Verify payment
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const paymentData = paymentVerificationSchema.parse(req.body);
      const isValid = await verifyPayment(paymentData);
      
      if (isValid) {
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: "Payment verification failed" });
    }
  });

  // Generate Kundali
  app.post("/api/kundali/generate", async (req, res) => {
    try {
      const formData = kundaliFormSchema.parse(req.body);
      
      if (!formData.paymentId) {
        return res.status(400).json({ error: "Payment ID is required" });
      }

      // Verify payment before generating kundali
      // In production, you would check the payment status in your database
      
      const kundaliData = await generateKundali(formData);
      res.json(kundaliData);
    } catch (error) {
      console.error("Kundali generation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to generate kundali" });
      }
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
