import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Customer, CustomerAddress } from "./customer-types";
import { getAllStoredOrders, saveStoredOrder } from "./order-store";

const DATA_DIR = path.join(process.cwd(), "data");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");
const ADDRESSES_FILE = path.join(DATA_DIR, "addresses.json");

function ensureCustomerDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CUSTOMERS_FILE)) {
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify([]), "utf8");
  }
  if (!fs.existsSync(ADDRESSES_FILE)) {
    fs.writeFileSync(ADDRESSES_FILE, JSON.stringify([]), "utf8");
  }
}

export function getAllCustomers(): Customer[] {
  ensureCustomerDirectories();
  try {
    const raw = fs.readFileSync(CUSTOMERS_FILE, "utf8");
    return JSON.parse(raw) as Customer[];
  } catch (err) {
    console.error("Error reading customers store:", err);
    return [];
  }
}

export function getCustomerByUid(uid: string): Customer | null {
  if (!uid) return null;
  const customers = getAllCustomers();
  return customers.find((c) => c.uid === uid) || null;
}

export function getCustomerByEmail(email: string): Customer | null {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const customers = getAllCustomers();
  return customers.find((c) => c.email && c.email.toLowerCase() === cleanEmail) || null;
}

export function getCustomerByPhone(phoneNumber: string): Customer | null {
  if (!phoneNumber) return null;
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const customers = getAllCustomers();
  return (
    customers.find((c) => {
      const cPhone = c.phoneNumber ? c.phoneNumber.replace(/\D/g, "") : "";
      return cPhone === cleanPhone || (cleanPhone.length >= 10 && cPhone.endsWith(cleanPhone.slice(-10)));
    }) || null
  );
}

export function saveCustomer(customer: Customer): void {
  ensureCustomerDirectories();
  const customers = getAllCustomers();
  const cleanEmail = (customer.email || "").trim().toLowerCase();

  // Match existing customer by UID or by matching Email
  const existingIdx = customers.findIndex(
    (c) => c.uid === customer.uid || (cleanEmail && c.email && c.email.toLowerCase() === cleanEmail)
  );

  if (existingIdx >= 0) {
    customers[existingIdx] = {
      ...customers[existingIdx],
      ...customer,
      updatedAt: new Date().toISOString(),
    };
  } else {
    customers.unshift(customer);
  }
  fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf8");
}

export function generateCustomerUid(): string {
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `CUST-${rand}`;
}

export function generateAddressId(): string {
  const rand = crypto.randomBytes(6).toString("hex");
  return `ADDR-${rand}`;
}

// ----------------- Address Book Operations -----------------

export function getAllAddresses(): CustomerAddress[] {
  ensureCustomerDirectories();
  try {
    const raw = fs.readFileSync(ADDRESSES_FILE, "utf8");
    return JSON.parse(raw) as CustomerAddress[];
  } catch (err) {
    console.error("Error reading addresses store:", err);
    return [];
  }
}

export function getCustomerAddresses(customerUid: string): CustomerAddress[] {
  if (!customerUid) return [];
  const addresses = getAllAddresses();
  return addresses.filter((a) => a.customerUid === customerUid);
}

export function getAddressById(addressId: string, customerUid: string): CustomerAddress | null {
  if (!addressId || !customerUid) return null;
  const addresses = getAllAddresses();
  return addresses.find((a) => a.addressId === addressId && a.customerUid === customerUid) || null;
}

export function saveCustomerAddress(address: CustomerAddress): void {
  ensureCustomerDirectories();
  const addresses = getAllAddresses();

  // If this address is set as default, unset isDefault on all other addresses for this customer
  if (address.isDefault) {
    for (const a of addresses) {
      if (a.customerUid === address.customerUid && a.addressId !== address.addressId) {
        a.isDefault = false;
        a.updatedAt = new Date().toISOString();
      }
    }
  } else {
    // If this is the customer's first address, automatically make it default
    const existingCustomerAddresses = addresses.filter((a) => a.customerUid === address.customerUid);
    if (existingCustomerAddresses.length === 0 || (existingCustomerAddresses.length === 1 && existingCustomerAddresses[0].addressId === address.addressId)) {
      address.isDefault = true;
    }
  }

  const existingIdx = addresses.findIndex((a) => a.addressId === address.addressId);
  if (existingIdx >= 0) {
    addresses[existingIdx] = address;
  } else {
    addresses.push(address);
  }

  fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(addresses, null, 2), "utf8");

  // Sync default address reference on customer record
  const customer = getCustomerByUid(address.customerUid);
  if (customer && address.isDefault) {
    customer.defaultAddressId = address.addressId;
    customer.updatedAt = new Date().toISOString();
    saveCustomer(customer);
  }
}

export function deleteCustomerAddress(addressId: string, customerUid: string): boolean {
  ensureCustomerDirectories();
  const addresses = getAllAddresses();
  const target = addresses.find((a) => a.addressId === addressId && a.customerUid === customerUid);
  if (!target) return false;

  const wasDefault = target.isDefault;
  const remaining = addresses.filter((a) => !(a.addressId === addressId && a.customerUid === customerUid));

  // If deleted address was default, promote the first remaining address to default
  if (wasDefault) {
    const nextDefault = remaining.find((a) => a.customerUid === customerUid);
    if (nextDefault) {
      nextDefault.isDefault = true;
      nextDefault.updatedAt = new Date().toISOString();

      const customer = getCustomerByUid(customerUid);
      if (customer) {
        customer.defaultAddressId = nextDefault.addressId;
        customer.updatedAt = new Date().toISOString();
        saveCustomer(customer);
      }
    } else {
      const customer = getCustomerByUid(customerUid);
      if (customer) {
        customer.defaultAddressId = undefined;
        customer.updatedAt = new Date().toISOString();
        saveCustomer(customer);
      }
    }
  }

  fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(remaining, null, 2), "utf8");
  return true;
}

export function setDefaultCustomerAddress(addressId: string, customerUid: string): boolean {
  ensureCustomerDirectories();
  const addresses = getAllAddresses();
  const target = addresses.find((a) => a.addressId === addressId && a.customerUid === customerUid);
  if (!target) return false;

  for (const a of addresses) {
    if (a.customerUid === customerUid) {
      a.isDefault = a.addressId === addressId;
      a.updatedAt = new Date().toISOString();
    }
  }

  fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(addresses, null, 2), "utf8");

  const customer = getCustomerByUid(customerUid);
  if (customer) {
    customer.defaultAddressId = addressId;
    customer.updatedAt = new Date().toISOString();
    saveCustomer(customer);
  }

  return true;
}

/**
 * Links any past guest orders placed with this email or phone number to the customer UID.
 */
export function linkOrdersToCustomer(customerUid: string, email?: string, phoneNumber?: string): number {
  if (!customerUid) return 0;
  const cleanEmail = email ? email.trim().toLowerCase() : "";
  const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, "").slice(-10) : "";
  const allOrders = getAllStoredOrders();
  let linkedCount = 0;

  for (const order of allOrders) {
    if ((order as any).customerUid === customerUid) continue;

    const orderEmail = (order.customerDetails?.email || "").trim().toLowerCase();
    const orderPhone = (order.customerDetails?.phone || "").replace(/\D/g, "").slice(-10);

    const matchesEmail = cleanEmail && orderEmail && orderEmail === cleanEmail;
    const matchesPhone = cleanPhone && orderPhone && orderPhone === cleanPhone;

    if (matchesEmail || matchesPhone) {
      (order as any).customerUid = customerUid;
      order.updatedAt = new Date().toISOString();
      saveStoredOrder(order);
      linkedCount++;
    }
  }

  return linkedCount;
}
