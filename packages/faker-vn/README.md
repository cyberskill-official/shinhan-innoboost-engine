# @cyberskill/faker-vn

Vietnamese-realistic synthetic data generator. Per P03-T04.

## Install

```bash
pnpm add @cyberskill/faker-vn
```

## API

```typescript
import { name, surname, givenName, address, phoneNumber, cccd } from '@cyberskill/faker-vn';

name({ seed: 42 });               // 'Nguyễn Thị Hương'
surname({ seed: 42 });            // 'Nguyễn'
givenName('female', 1995);        // 'Linh'
address({ seed: 42 });            // { province, district, ward, street_no }
phoneNumber({ seed: 42 });        // '+84 901 234 567'
cccd({ seed: 42, gender: 'F' });  // '999201234567' (synthetic-province prefix 999)
```

## Important: synthetic-marker patterns

CCCDs always begin with the synthetic-province code `999`; no real CCCD can match. Document any consumer must verify this pattern before storing in any production system.

## Data sources

- Administrative hierarchy: VN General Statistics Office (province / district / ward).
- Surname distribution: published linguistic data; manually verified.
- Phone prefixes: VN carrier standards (Viettel, Mobifone, Vinaphone, Vietnamobile).

## See also

- P03-T04 — Faker-VN tooling FR
