export interface PincodeCheckResult {
  pincode: string;
  isServiceable: boolean;
  city?: string;
  state?: string;
  estimatedDays?: number;
  deliveryDateStr?: string;
  courierPartner?: string;
  message: string;
}

// Common metro & prominent hubs for realistic instant pincode lookup
const PINCODE_PREFIX_MAP: Record<string, { city: string; state: string; days: number }> = {
  "11": { city: "New Delhi", state: "Delhi", days: 2 },
  "12": { city: "Gurugram / Faridabad", state: "Haryana", days: 2 },
  "20": { city: "Noida / Ghaziabad", state: "Uttar Pradesh", days: 2 },
  "40": { city: "Mumbai", state: "Maharashtra", days: 2 },
  "41": { city: "Pune", state: "Maharashtra", days: 2 },
  "56": { city: "Bengaluru", state: "Karnataka", days: 2 },
  "50": { city: "Hyderabad", state: "Telangana", days: 3 },
  "60": { city: "Chennai", state: "Tamil Nadu", days: 3 },
  "70": { city: "Kolkata", state: "West Bengal", days: 3 },
  "38": { city: "Ahmedabad", state: "Gujarat", days: 2 },
  "39": { city: "Surat", state: "Gujarat", days: 2 },
  "30": { city: "Jaipur", state: "Rajasthan", days: 3 },
  "16": { city: "Chandigarh", state: "Punjab", days: 3 },
  "68": { city: "Kochi", state: "Kerala", days: 3 },
  "45": { city: "Indore", state: "Madhya Pradesh", days: 3 },
  "22": { city: "Lucknow", state: "Uttar Pradesh", days: 3 },
};

export function checkIndianPincode(pincode: string): PincodeCheckResult {
  const cleanPin = pincode.trim().replace(/\D/g, "");
  
  if (cleanPin.length !== 6) {
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
  const state = matched ? matched.state : "India";

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
    message: `Delivery available by ${deliveryDateStr} via Express Air.`
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}
