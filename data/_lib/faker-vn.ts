// data/_lib/faker-vn.ts
// P03-T04 — Faker-VN extension for VN-realistic synthetic data
// Seedable, reproducible, clearly synthetic patterns (no real PII collision).

// ─── Seeded Random ───────────────────────────────────────

export class SeededRandom {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed;
  }

  /** Returns a number in [0, 1) */
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) & 0xffffffff;
    return (this.state >>> 0) / 0x100000000;
  }

  /** Returns an integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Pick a random element from an array */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)]!;
  }

  /** Pick N unique elements from an array */
  pickN<T>(arr: readonly T[], n: number): T[] {
    const copy = [...arr];
    const result: T[] = [];
    for (let i = 0; i < Math.min(n, copy.length); i++) {
      const idx = Math.floor(this.next() * copy.length);
      result.push(copy.splice(idx, 1)[0]!);
    }
    return result;
  }

  /** Returns a float in [min, max) */
  float(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Weighted random selection */
  weighted<T>(items: readonly { value: T; weight: number }[]): T {
    const total = items.reduce((sum, i) => sum + i.weight, 0);
    let r = this.next() * total;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item.value;
    }
    return items[items.length - 1]!.value;
  }
}

// ─── VN Name Generator ──────────────────────────────────

const VN_FAMILY_NAMES = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ',
  'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý',
] as const;

const VN_MIDDLE_NAMES = [
  'Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Thanh', 'Quốc', 'Ngọc',
  'Anh', 'Hoàng', 'Trung', 'Phương', 'Thành', 'Xuân', 'Kim',
] as const;

const VN_GIVEN_NAMES = [
  'An', 'Bình', 'Chi', 'Dũng', 'Em', 'Giang', 'Hà', 'Hùng',
  'Khánh', 'Lan', 'Long', 'Mai', 'Nam', 'Ngân', 'Phúc', 'Quân',
  'Sơn', 'Thảo', 'Trang', 'Tuấn', 'Uyên', 'Vinh', 'Yến', 'Hạnh',
] as const;

// ─── VN Geography ────────────────────────────────────────

export const VN_PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Bình Dương', 'Đồng Nai', 'Long An', 'Bà Rịa–Vũng Tàu', 'Khánh Hòa',
  'Thanh Hóa', 'Nghệ An', 'Quảng Ninh', 'Thừa Thiên Huế', 'Bắc Ninh',
  'Lâm Đồng', 'Tiền Giang', 'Bến Tre', 'Kiên Giang', 'An Giang',
  'Gia Lai', 'Đắk Lắk', 'Quảng Nam', 'Bình Thuận', 'Hà Tĩnh',
  'Vĩnh Phúc', 'Thái Nguyên', 'Nam Định', 'Ninh Bình', 'Phú Thọ',
  'Hưng Yên', 'Hải Dương',
] as const;

const VN_DISTRICTS_HCM = [
  'Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh',
  'Phú Nhuận', 'Tân Bình', 'Gò Vấp', 'Thủ Đức',
] as const;

const VN_STREETS = [
  'Nguyễn Huệ', 'Lê Lợi', 'Đồng Khởi', 'Hai Bà Trưng', 'Trần Hưng Đạo',
  'Pasteur', 'Điện Biên Phủ', 'Cách Mạng Tháng 8', 'Nguyễn Trãi', 'Lý Tự Trọng',
  'Võ Văn Tần', 'Nam Kỳ Khởi Nghĩa', 'Phạm Ngọc Thạch', 'Nguyễn Thị Minh Khai',
] as const;

// ─── VN Stock Market ─────────────────────────────────────

export const HOSE_SYMBOLS = [
  'VNM', 'VCB', 'VHM', 'VIC', 'HPG', 'FPT', 'MWG', 'TCB', 'MBB', 'ACB',
  'VPB', 'STB', 'SSI', 'REE', 'PNJ', 'MSN', 'VRE', 'GAS', 'SAB', 'PLX',
  'BVH', 'CTG', 'BID', 'SHB', 'EIB', 'HDB', 'LPB', 'OCB', 'TPB', 'KDH',
  'DXG', 'NVL', 'PDR', 'DIG', 'IJC', 'PHR', 'GEX', 'PC1', 'POW', 'PVD',
] as const;

export const HNX_SYMBOLS = [
  'SHS', 'PVS', 'CEO', 'IDC', 'NVB', 'HUT', 'TNG', 'DTD', 'BCC', 'NBC',
] as const;

// ─── Faker-VN Class ──────────────────────────────────────

export class FakerVN {
  private readonly rng: SeededRandom;

  constructor(seed: number = 42) {
    this.rng = new SeededRandom(seed);
  }

  fullName(): string {
    return `${this.rng.pick(VN_FAMILY_NAMES)} ${this.rng.pick(VN_MIDDLE_NAMES)} ${this.rng.pick(VN_GIVEN_NAMES)}`;
  }

  /** Clearly synthetic — starts with 'SYN-' prefix */
  cccd(): string {
    return `SYN-${this.rng.int(10, 99)}${this.rng.int(1000000000, 9999999999)}`;
  }

  phone(): string {
    const prefixes = ['09', '03', '07', '08', '05'];
    return `${this.rng.pick(prefixes)}${this.rng.int(10000000, 99999999)}`;
  }

  email(name?: string): string {
    const base = (name ?? this.fullName()).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/\s+/g, '.').slice(0, 20);
    return `${base}.syn${this.rng.int(100, 999)}@example.vn`;
  }

  address(): string {
    const num = this.rng.int(1, 500);
    const street = this.rng.pick(VN_STREETS);
    const district = this.rng.pick(VN_DISTRICTS_HCM);
    return `${num} ${street}, ${district}, TP. HCM`;
  }

  province(): string {
    return this.rng.pick(VN_PROVINCES);
  }

  /** VND amount at realistic magnitude */
  vndAmount(min: number, max: number): number {
    return Math.round(this.rng.float(min, max) / 1000) * 1000;
  }

  /** Realistic VN bank account number (synthetic prefix) */
  accountNumber(): string {
    return `SYN${this.rng.int(1000000000, 9999999999)}`;
  }

  /** Date between start and end */
  date(start: Date, end: Date): Date {
    const ms = start.getTime() + this.rng.next() * (end.getTime() - start.getTime());
    return new Date(ms);
  }

  /** ISO date string between start and end */
  dateStr(start: string, end: string): string {
    return this.date(new Date(start), new Date(end)).toISOString().slice(0, 10);
  }

  stockSymbol(exchange: 'HOSE' | 'HNX' = 'HOSE'): string {
    return this.rng.pick(exchange === 'HOSE' ? HOSE_SYMBOLS : HNX_SYMBOLS);
  }

  /** Stock price in VND (realistic range) */
  stockPrice(min: number = 5000, max: number = 200000): number {
    return Math.round(this.rng.float(min, max) / 100) * 100;
  }

  /** Unique ID generator */
  uuid(): string {
    const hex = () => this.rng.int(0, 15).toString(16);
    return `${Array.from({ length: 8 }, hex).join('')}-${Array.from({ length: 4 }, hex).join('')}-4${Array.from({ length: 3 }, hex).join('')}-${this.rng.pick(['8', '9', 'a', 'b'])}${Array.from({ length: 3 }, hex).join('')}-${Array.from({ length: 12 }, hex).join('')}`;
  }

  get random(): SeededRandom {
    return this.rng;
  }
}
