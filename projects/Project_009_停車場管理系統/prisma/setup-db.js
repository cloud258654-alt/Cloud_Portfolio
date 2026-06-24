import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS parking_lots (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      used_spaces INTEGER NOT NULL DEFAULT 0,
      available_spaces INTEGER NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS rate_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      free_minutes INTEGER NOT NULL DEFAULT 30,
      hourly_rate INTEGER NOT NULL DEFAULT 40,
      daily_max_fee INTEGER NOT NULL DEFAULT 300,
      exit_grace_minutes INTEGER NOT NULL DEFAULT 10,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate_number TEXT NOT NULL UNIQUE,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS monthly_cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate_number TEXT NOT NULL UNIQUE,
      owner_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS parking_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate_number TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      entry_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      exit_time DATETIME,
      fee INTEGER,
      paid BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'IN_PARKING',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parking_record_id INTEGER NOT NULL,
      plate_number TEXT NOT NULL,
      amount INTEGER NOT NULL,
      original_amount INTEGER NOT NULL DEFAULT 0,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      discount_code TEXT,
      payment_method TEXT NOT NULL DEFAULT 'SIMULATED',
      paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'PAID',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT payments_parking_record_id_fkey
        FOREIGN KEY (parking_record_id) REFERENCES parking_records (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);

  await addColumnIfMissing('payments', 'original_amount', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing('payments', 'discount_amount', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing('payments', 'discount_code', 'TEXT');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate_number TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      status TEXT NOT NULL DEFAULT 'RESERVED',
      note TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS discount_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      discount_type TEXT NOT NULL DEFAULT 'AMOUNT',
      discount_value INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS lpr_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate_number TEXT NOT NULL,
      direction TEXT NOT NULL,
      confidence INTEGER NOT NULL,
      result_status TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS exception_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      plate_number TEXT,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      operator TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      handled_by TEXT,
      handled_at DATETIME,
      note TEXT
    )
  `);

  await addColumnIfMissing('exception_events', 'status', "TEXT NOT NULL DEFAULT 'OPEN'");
  await addColumnIfMissing('exception_events', 'handled_by', 'TEXT');
  await addColumnIfMissing('exception_events', 'handled_at', 'DATETIME');
  await addColumnIfMissing('exception_events', 'note', 'TEXT');

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS parking_records_plate_status_idx
      ON parking_records (plate_number, status)
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS parking_records_entry_time_idx
      ON parking_records (entry_time)
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS payments_parking_record_id_idx
      ON payments (parking_record_id)
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS reservations_plate_status_idx
      ON reservations (plate_number, status)
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS lpr_scans_created_at_idx
      ON lpr_scans (created_at)
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS exception_events_occurred_at_idx
      ON exception_events (occurred_at)
  `);
}

async function addColumnIfMissing(table, column, definition) {
  const columns = await prisma.$queryRawUnsafe(`PRAGMA table_info(${table})`);
  if (!columns.some((item) => item.name === column)) {
    await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
