export interface PincodeCheckResult {
  pincode: string;
  isServiceable: boolean;
  city?: string;
  state?: string;
  localities?: string[];
  estimatedDays?: number;
  deliveryDateStr?: string;
  courierPartner?: string;
  message: string;
}

export const FREE_SHIPPING_THRESHOLD = 499;
export const STANDARD_SHIPPING_FEE = 49;

export function calculateShippingFee(subtotalAfterDiscount: number): number {
  if (subtotalAfterDiscount <= 0) return 0;
  return subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function calculateOrderTotals(subtotal: number, discount: number = 0) {
  const merchandiseSubtotal = Math.max(0, subtotal - discount);
  const shippingFee = subtotal === 0 ? 0 : calculateShippingFee(merchandiseSubtotal);
  const finalTotal = merchandiseSubtotal + shippingFee;
  const isFreeShipping = merchandiseSubtotal >= FREE_SHIPPING_THRESHOLD;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - merchandiseSubtotal);

  return {
    subtotal,
    discount,
    merchandiseSubtotal,
    shippingFee,
    finalTotal,
    isFreeShipping,
    amountNeededForFreeShipping,
  };
}

export interface IndianRegion {
  code: string;
  name: string;
  type: "state" | "ut";
}

// 28 Indian States + 8 Union Territories
export const INDIAN_STATES_AND_UTS: IndianRegion[] = [
  // 28 States
  { code: "AP", name: "Andhra Pradesh", type: "state" },
  { code: "AR", name: "Arunachal Pradesh", type: "state" },
  { code: "AS", name: "Assam", type: "state" },
  { code: "BR", name: "Bihar", type: "state" },
  { code: "CG", name: "Chhattisgarh", type: "state" },
  { code: "GA", name: "Goa", type: "state" },
  { code: "GJ", name: "Gujarat", type: "state" },
  { code: "HR", name: "Haryana", type: "state" },
  { code: "HP", name: "Himachal Pradesh", type: "state" },
  { code: "JH", name: "Jharkhand", type: "state" },
  { code: "KA", name: "Karnataka", type: "state" },
  { code: "KL", name: "Kerala", type: "state" },
  { code: "MP", name: "Madhya Pradesh", type: "state" },
  { code: "MH", name: "Maharashtra", type: "state" },
  { code: "MN", name: "Manipur", type: "state" },
  { code: "ML", name: "Meghalaya", type: "state" },
  { code: "MZ", name: "Mizoram", type: "state" },
  { code: "NL", name: "Nagaland", type: "state" },
  { code: "OR", name: "Odisha", type: "state" },
  { code: "PB", name: "Punjab", type: "state" },
  { code: "RJ", name: "Rajasthan", type: "state" },
  { code: "SK", name: "Sikkim", type: "state" },
  { code: "TN", name: "Tamil Nadu", type: "state" },
  { code: "TG", name: "Telangana", type: "state" },
  { code: "TR", name: "Tripura", type: "state" },
  { code: "UP", name: "Uttar Pradesh", type: "state" },
  { code: "UK", name: "Uttarakhand", type: "state" },
  { code: "WB", name: "West Bengal", type: "state" },

  // 8 Union Territories
  { code: "AN", name: "Andaman and Nicobar Islands", type: "ut" },
  { code: "CH", name: "Chandigarh", type: "ut" },
  { code: "DH", name: "Dadra and Nagar Haveli and Daman and Diu", type: "ut" },
  { code: "DL", name: "Delhi", type: "ut" },
  { code: "JK", name: "Jammu and Kashmir", type: "ut" },
  { code: "LA", name: "Ladakh", type: "ut" },
  { code: "LD", name: "Lakshadweep", type: "ut" },
  { code: "PY", name: "Puducherry", type: "ut" },
];

export function findMatchingState(rawState: string): string | undefined {
  if (!rawState) return undefined;
  const clean = rawState.trim().toLowerCase();
  
  // Direct match by name
  const direct = INDIAN_STATES_AND_UTS.find(
    (s) => s.name.toLowerCase() === clean || s.code.toLowerCase() === clean
  );
  if (direct) return direct.name;

  // Synonyms and common variants
  const aliases: Record<string, string> = {
    "delhi": "Delhi",
    "delhi ncr": "Delhi",
    "new delhi": "Delhi",
    "nct of delhi": "Delhi",
    "orissa": "Odisha",
    "pondicherry": "Puducherry",
    "jammu & kashmir": "Jammu and Kashmir",
    "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
    "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
    "uttaranchal": "Uttarakhand",
    "bengal": "West Bengal",
    "wb": "West Bengal",
  };

  return aliases[clean] || undefined;
}

// Common metro & prominent hubs for realistic offline/fallback pincode lookup
export const PINCODE_PREFIX_MAP: Record<string, { city: string; state: string; days: number }> = {
  "11": { city: "New Delhi", state: "Delhi", days: 2 },
  "12": { city: "Gurugram / Faridabad", state: "Haryana", days: 2 },
  "13": { city: "Panipat / Rohtak", state: "Haryana", days: 3 },
  "14": { city: "Ludhiana / Jalandhar", state: "Punjab", days: 3 },
  "15": { city: "Bathinda", state: "Punjab", days: 3 },
  "16": { city: "Chandigarh", state: "Chandigarh", days: 2 },
  "17": { city: "Shimla", state: "Himachal Pradesh", days: 4 },
  "18": { city: "Jammu", state: "Jammu and Kashmir", days: 4 },
  "19": { city: "Srinagar", state: "Jammu and Kashmir", days: 4 },
  "20": { city: "Noida / Ghaziabad", state: "Uttar Pradesh", days: 2 },
  "21": { city: "Prayagraj", state: "Uttar Pradesh", days: 3 },
  "22": { city: "Lucknow", state: "Uttar Pradesh", days: 3 },
  "23": { city: "Varanasi", state: "Uttar Pradesh", days: 3 },
  "24": { city: "Dehradun / Bareilly", state: "Uttarakhand", days: 3 },
  "25": { city: "Meerut", state: "Uttar Pradesh", days: 3 },
  "26": { city: "Pilibhit", state: "Uttar Pradesh", days: 3 },
  "27": { city: "Gorakhpur", state: "Uttar Pradesh", days: 3 },
  "28": { city: "Agra / Jhansi", state: "Uttar Pradesh", days: 3 },
  "30": { city: "Jaipur", state: "Rajasthan", days: 3 },
  "31": { city: "Udaipur", state: "Rajasthan", days: 3 },
  "32": { city: "Kota", state: "Rajasthan", days: 3 },
  "33": { city: "Bikaner", state: "Rajasthan", days: 3 },
  "34": { city: "Jodhpur", state: "Rajasthan", days: 3 },
  "36": { city: "Rajkot", state: "Gujarat", days: 3 },
  "37": { city: "Bhuj", state: "Gujarat", days: 3 },
  "38": { city: "Ahmedabad", state: "Gujarat", days: 2 },
  "39": { city: "Surat / Vadodara", state: "Gujarat", days: 2 },
  "40": { city: "Mumbai", state: "Maharashtra", days: 2 },
  "41": { city: "Pune", state: "Maharashtra", days: 2 },
  "42": { city: "Nashik", state: "Maharashtra", days: 2 },
  "43": { city: "Chhatrapati Sambhajinagar", state: "Maharashtra", days: 3 },
  "44": { city: "Nagpur", state: "Maharashtra", days: 3 },
  "45": { city: "Indore", state: "Madhya Pradesh", days: 3 },
  "46": { city: "Bhopal", state: "Madhya Pradesh", days: 3 },
  "47": { city: "Gwalior", state: "Madhya Pradesh", days: 3 },
  "48": { city: "Jabalpur", state: "Madhya Pradesh", days: 3 },
  "49": { city: "Raipur", state: "Chhattisgarh", days: 3 },
  "50": { city: "Hyderabad", state: "Telangana", days: 3 },
  "51": { city: "Tirupati / Kadapa", state: "Andhra Pradesh", days: 3 },
  "52": { city: "Vijayawada", state: "Andhra Pradesh", days: 3 },
  "53": { city: "Visakhapatnam", state: "Andhra Pradesh", days: 3 },
  "56": { city: "Bengaluru", state: "Karnataka", days: 2 },
  "57": { city: "Mangaluru", state: "Karnataka", days: 3 },
  "58": { city: "Hubballi / Belagavi", state: "Karnataka", days: 3 },
  "59": { city: "Kalaburagi", state: "Karnataka", days: 3 },
  "60": { city: "Chennai", state: "Tamil Nadu", days: 2 },
  "61": { city: "Thanjavur", state: "Tamil Nadu", days: 3 },
  "62": { city: "Madurai", state: "Tamil Nadu", days: 3 },
  "63": { city: "Salem", state: "Tamil Nadu", days: 3 },
  "64": { city: "Coimbatore", state: "Tamil Nadu", days: 3 },
  "67": { city: "Kozhikode", state: "Kerala", days: 3 },
  "68": { city: "Kochi", state: "Kerala", days: 3 },
  "69": { city: "Thiruvananthapuram", state: "Kerala", days: 3 },
  "70": { city: "Kolkata", state: "West Bengal", days: 3 },
  "71": { city: "Howrah", state: "West Bengal", days: 3 },
  "72": { city: "Medinipur", state: "West Bengal", days: 3 },
  "73": { city: "Siliguri", state: "West Bengal", days: 4 },
  "74": { city: "North 24 Parganas", state: "West Bengal", days: 3 },
  "75": { city: "Bhubaneswar", state: "Odisha", days: 3 },
  "76": { city: "Cuttack / Sambalpur", state: "Odisha", days: 3 },
  "77": { city: "Rourkela", state: "Odisha", days: 3 },
  "78": { city: "Guwahati", state: "Assam", days: 4 },
  "79": { city: "North-East Region", state: "Assam", days: 5 },
  "80": { city: "Patna", state: "Bihar", days: 3 },
  "81": { city: "Gaya", state: "Bihar", days: 3 },
  "82": { city: "Dhanbad", state: "Jharkhand", days: 3 },
  "83": { city: "Ranchi / Jamshedpur", state: "Jharkhand", days: 3 },
  "84": { city: "Muzaffarpur", state: "Bihar", days: 3 },
  "85": { city: "Purnia", state: "Bihar", days: 4 },
};

export function checkIndianPincode(pincode: string): PincodeCheckResult {
  const cleanPin = pincode.trim().replace(/\D/g, "");
  
  if (cleanPin.length !== 6 || cleanPin.startsWith("0")) {
    return {
      pincode: cleanPin,
      isServiceable: false,
      message: "Please enter a valid 6-digit Indian PIN code."
    };
  }

  const prefix = cleanPin.substring(0, 2);
  const matched = PINCODE_PREFIX_MAP[prefix];

  const days = matched ? matched.days : 4;
  const city = matched ? matched.city : "Your City";
  const state = matched ? matched.state : "";

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: "short", 
    month: "short", 
    day: "numeric" 
  };
  const deliveryDateStr = targetDate.toLocaleDateString("en-IN", options);

  return {
    pincode: cleanPin,
    isServiceable: true,
    city,
    state,
    estimatedDays: days,
    deliveryDateStr,
    courierPartner: days <= 2 ? "BlueDart Express" : "Delhivery Surface",
    message: `Estimated delivery by ${deliveryDateStr} via Express Air.`
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}
