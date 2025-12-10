// ==========================================================
// index.js — Cloud Run Gateway V3.1 Final (2025)
// ==========================================================

import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import {
  // 基礎
  logInfo, logWarn, logError, logDebug,

  // system.*
  logSystemBoot, logSystemConfig, logSystemError,

  // retail.*
  logRetailCreated,

  // retail.linepay.*
  logRetailLinepayRequest,
  logRetailLinepayConfirmStart,
  logRetailLinepayConfirmSuccess,
  logRetailLinepayConfirmFailed,
  logRetailLinepayError,

  // linepay.refund.*
  logLinepayRefundRequest,
  logLinepayRefundComplete,
  logLinepayRefundFailed,

  // booking.*
  logBookingCreated,
  logBookingUpdated,
  logBookingDeleted,

  // gas.write.*
  logGasWriteSuccess,
  logGasWriteFailed
} from "./logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================================
// Secret Loader
// ==========================================================
function loadSecret(fp) {
  try {
    return fs.readFileSync(path.resolve(fp), "utf8").trim();
  } catch {
    return undefined;
  }
}

const LINEPAY_CHANNEL_ID = loadSecret("/etc/secrets/linepay/id/LINEPAY_CHANNEL_ID");
const LINEPAY_CHANNEL_SECRET = loadSecret("/etc/secrets/linepay/secret/LINEPAY_CHANNEL_SECRET");

// ==========================================================
// Environment
// ==========================================================
const LINEPAY_API_BASE = process.env.LINEPAY_API_BASE || "https://sandbox-api-pay.line.me";
const REDIRECT_BASE = process.env.LINEPAY_REDIRECT_BASE;
const GAS_ENDPOINT = process.env.GAS_ENDPOINT;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://shanse-reservation.vercel.app";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const oauthClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// ==========================================================
// Startup Log
// ==========================================================
logSystemBoot({
  LINEPAY_API_BASE,
  REDIRECT_BASE,
  GAS_ENDPOINT,
  ALLOWED_ORIGIN,
  channelSecretExists: !!LINEPAY_CHANNEL_SECRET,
  channelIdExists: !!LINEPAY_CHANNEL_ID,
  googleClientIdExists: !!GOOGLE_CLIENT_ID,
  adminEmails: ADMIN_EMAILS
});

// ==========================================================
// Middleware
// ==========================================================
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origin === ALLOWED_ORIGIN) return cb(null, true);
      logWarn("system.cors.blocked", { origin });
      cb(null, false);
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================================
// Admin Auth
// ==========================================================
async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ success: false, error: "Missing token" });

    const idToken = authHeader.substring(7);

    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();

    if (!ADMIN_EMAILS.includes(email)) {
      logWarn("system.auth.denied", { email });
      return res.status(403).json({ success: false, error: "Not allowed" });
    }

    req.adminEmail = email;
    next();

  } catch (err) {
    logSystemError({ error: err.message });
    return res.status(401).json({ success: false, error: "Auth failed" });
  }
}

// ==========================================================
// Line Pay Header Builder
// ==========================================================
function buildLinepayHeaders(apiPath, method, bodyObj = null, queryString = "") {
  const nonce = crypto.randomUUID();
  const bodyJson = method === "POST" ? JSON.stringify(bodyObj || {}) : "";

  const raw =
    method === "GET"
      ? LINEPAY_CHANNEL_SECRET + apiPath + queryString + nonce
      : LINEPAY_CHANNEL_SECRET + apiPath + bodyJson + nonce;

  const signature = crypto
    .createHmac("sha256", LINEPAY_CHANNEL_SECRET)
    .update(raw)
    .digest("base64");

  return {
    headers: {
      "Content-Type": "application/json",
      "X-LINE-ChannelId": LINEPAY_CHANNEL_ID,
      "X-LINE-Authorization-Nonce": nonce,
      "X-LINE-Authorization": signature
    },
    bodyJson
  };
}

// ==========================================================
// Health Check
// ==========================================================
app.get("/", (req, res) => {
  res.json({ ok: true, service: "linepay-proxy-v3.1" });
});

// ==========================================================
// 1. Line Pay Request
// ==========================================================
app.post("/linepay/request", async (req, res) => {
  try {
    const { amount, productName, customer, items } = req.body;
    const orderId = "LP-" + Date.now();

    logRetailLinepayRequest({ orderId, amount, customer, items });

    const apiPath = "/v3/payments/request";

    const body = {
      amount: Number(amount),
      currency: "TWD",
      orderId,
      packages: [
        {
          id: "pkg",
          amount: Number(amount),
          name: productName || "山色商品訂單",
          products: [{ name: productName, quantity: 1, price: Number(amount) }]
        }
      ],
      redirectUrls: {
        confirmUrl: `${REDIRECT_BASE}/linepay-result?orderId=${orderId}&amount=${amount}`,
        cancelUrl: `${REDIRECT_BASE}/linepay-cancel`
      }
    };

    const { headers, bodyJson } = buildLinepayHeaders(apiPath, "POST", body);

    const resp = await fetch(`${LINEPAY_API_BASE}${apiPath}`, {
      method: "POST",
      headers,
      body: bodyJson
    });

    const json = await resp.json();

    if (json.returnCode !== "0000") {
      logRetailLinepayConfirmFailed({ orderId, json });
      return res.json({ result: "error", raw: json });
    }

    return res.json({
      result: "success",
      orderId,
      transactionId: json.info.transactionId,
      paymentUrl: json.info.paymentUrl.web
    });

  } catch (err) {
    logRetailLinepayError({ error: err.message });
    res.json({ result: "error", message: err.message });
  }
});

// ==========================================================
// 2. Line Pay Confirm
// ==========================================================
app.post("/linepay/confirm", async (req, res) => {
  try {
    const { transactionId, amount, orderId, customer, items, subtotal, shipping } = req.body;

    logRetailLinepayConfirmStart({ orderId, transactionId });

    const apiPath = `/v3/payments/${transactionId}/confirm`;
    const body = { amount: Number(amount), currency: "TWD" };

    const { headers, bodyJson } = buildLinepayHeaders(apiPath, "POST", body);

    const resp = await fetch(`${LINEPAY_API_BASE}${apiPath}`, {
      method: "POST",
      headers,
      body: bodyJson
    });

    const json = await resp.json();

    if (json.returnCode !== "0000") {
      logRetailLinepayConfirmFailed({ orderId, json });
      return res.json({ result: "error", raw: json });
    }

    logRetailLinepayConfirmSuccess({ orderId, transactionId, amount });

    // ---- 回寫 GAS ----
    const gasPayload = {
      type: "retailOrderLinepay",
      orderId,
      customer: JSON.stringify(customer || {}),
      items: JSON.stringify(items || []),
      subtotal,
      shipping,
      transactionId
    };

    const gasRes = await fetch(GAS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(gasPayload)
    });

    const gasJson = await gasRes.json();

    if (gasJson?.result === "success")
      logGasWriteSuccess({ orderId });
    else
      logGasWriteFailed({ orderId, gasJson });

    return res.json(gasJson);

  } catch (err) {
    logRetailLinepayError({ error: err.message });
    return res.json({ result: "error", message: err.message });
  }
});

// ==========================================================
// 3. Line Pay Refund
// ==========================================================
app.post("/linepay/refund", adminAuth, async (req, res) => {
  try {
    const { transactionId, refundAmount, orderId } = req.body;

    logLinepayRefundRequest({ orderId, transactionId, refundAmount });

    const apiPath = `/v3/payments/${transactionId}/refund`;
    const body = refundAmount ? { refundAmount: Number(refundAmount) } : {};

    const { headers, bodyJson } = buildLinepayHeaders(apiPath, "POST", body);

    const resp = await fetch(`${LINEPAY_API_BASE}${apiPath}`, {
      method: "POST",
      headers,
      body: bodyJson
    });

    const json = await resp.json();

    if (json.returnCode !== "0000") {
      logLinepayRefundFailed({ orderId, raw: json });
      return res.json({ success: false, raw: json });
    }

    const refundInfo = json.info || {};

    logLinepayRefundComplete({
      orderId,
      transactionId,
      refundAmount: refundInfo.refundAmount,
      refundTransactionId: refundInfo.refundTransactionId
    });

    const gasPayload = {
      type: "refundOrderLinepay",
      orderId,
      transactionId,
      refundTransactionId: refundInfo.refundTransactionId,
      refundAmount: refundInfo.refundAmount,
      refundTime: new Date().toISOString()
    };

    const gasRes = await fetch(GAS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(gasPayload)
    });

    const gasJson = await gasRes.json();

    if (gasJson?.success || gasJson?.result === "success")
      logGasWriteSuccess({ orderId });
    else
      logGasWriteFailed({ orderId });

    return res.json({
      success: true,
      gasResult: gasJson
    });

  } catch (err) {
    logLinepayRefundFailed({ error: err.message });
    return res.json({ success: false, error: err.message });
  }
});

// ==========================================================
// 4. Booking API（Admin Only）
// ==========================================================
async function callGAS(payload) {
  const resp = await fetch(GAS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(payload)
  });
  return await resp.json();
}

// list
app.get("/admin/booking/list", adminAuth, async (req, res) => {
  try {
    const data = await callGAS({ type: "bookingList", date: req.query.date });
    res.json({ success: true, rows: data.rows || [] });

  } catch (err) {
    logError("booking.list.error", { message: err.message });
    res.json({ success: false });
  }
});

// create
app.post("/admin/booking/create", adminAuth, async (req, res) => {
  try {
    const payload = { type: "bookingCreate", ...req.body };
    const result = await callGAS(payload);

    logBookingCreated(result);
    res.json(result);

  } catch (err) {
    logError("booking.create.error", { message: err.message });
    res.json({ success: false });
  }
});

// update
app.post("/admin/booking/update", adminAuth, async (req, res) => {
  try {
    const payload = { type: "bookingUpdate", ...req.body };
    const result = await callGAS(payload);

    logBookingUpdated(result);
    res.json(result);

  } catch (err) {
    logError("booking.update.error", { message: err.message });
    res.json({ success: false });
  }
});

// delete
app.post("/admin/booking/delete", adminAuth, async (req, res) => {
  try {
    const payload = { type: "bookingDelete", bookingId: req.body.bookingId };
    const result = await callGAS(payload);

    logBookingDeleted(result);
    res.json(result);

  } catch (err) {
    logError("booking.delete.error", { message: err.message });
    res.json({ success: false });
  }
});

// ==========================================================
// Start Server
// ==========================================================
app.listen(PORT, () => {
  logSystemBoot({ port: PORT });
});
