


export class Snowflake {
  public static DISCORD_EPOCH = 1420070400000n as const;
  private static increment = 0n;
  public readonly value: string;
  public static isValidSnowflake(value: unknown): value is Snowflake {
    if (typeof value !== "string") return false;

    // Discord IDs should be digits only
    if (!/^\d+$/.test(value)) return false;

    try {
      const id = BigInt(value);

      // Must fit inside unsigned 64-bit range
      return id >= 0n && id <= 18446744073709551615n;
    } catch {
      return false;
    }
  }
  public static isSnowflake (value: unknown): value is Snowflake {
    if (!Snowflake.isValidSnowflake(value)) return false;
    if (typeof value !== "string") return false;
    const id = BigInt(value);

    const timestampMs = (id >> 22n) + Snowflake.DISCORD_EPOCH;

    return timestampMs >= Snowflake.DISCORD_EPOCH;
  }
  public static toInternalWorkerId (value: string): bigint {
    if (!Snowflake.isValidSnowflake(value)) throw new Error("Invalid Snowflake ID");

    const id = BigInt(value);

    const internalId = (id & 0x3E0000n) >> 17n;
    return internalId;
  }
  public static toInternalProcessId (value: string): bigint {
    if (!Snowflake.isValidSnowflake(value)) throw new Error("Invalid Snowflake ID");

    const id = BigInt(value);

    const internalId = (id & 0x1F000n) >> 12n;
    return internalId;
  }
  public static toIncrement (value: string): bigint {
    if (!Snowflake.isValidSnowflake(value)) throw new Error("Invalid Snowflake ID");

    const id = BigInt(value);

    const increment = id & 0xFFFn;
    return increment;
  }
  public static toTimestamp (snowflake: string): Date {
    const id = BigInt(snowflake);

    const timestampMs = (id >> 22n) + Snowflake.DISCORD_EPOCH;

    return new Date(Number(timestampMs));
  }
  public static fromTimestamp(date: Date): Snowflake {
    const timestampMs = BigInt(date.getTime());

    return ((timestampMs - Snowflake.DISCORD_EPOCH) << 22n).toString() as unknown as Snowflake;
  }
  toSnowflake(): Snowflake {
    return this.value as unknown as Snowflake;
  }
  constructor (value?: string) {
    const snowflake = value ?? Snowflake.generate();
    if (typeof snowflake !== "string") {
      throw new Error("Snowflake ID must be a string");
    }
    if (!/^\d+$/.test(snowflake)) {
      throw new Error("Snowflake ID must contain only digits");
    }
    if (!Snowflake.isValidSnowflake(snowflake)) {
      throw new Error("Invalid Snowflake ID");
    }
    if (!Snowflake.isSnowflake(snowflake)) {
      throw new Error("Value is not a valid Snowflake ID");
    }
    this.value = snowflake;
    return this.toSnowflake();
  }
  public static generate (date: Date = new Date()): Snowflake & string {
    const timestampMs = BigInt(date.getTime());

    const timestamp = (timestampMs - Snowflake.DISCORD_EPOCH) << 22n;

    const workerId = 0n << 17n;
    const processId = 0n << 12n;
    const increment = Snowflake.increment++ & 0xFFFn;

    return (timestamp | workerId | processId | increment).toString() as unknown as Snowflake & string;
  }
  public get timestamp () {
    return Snowflake.toTimestamp(this.value);
  }
  public get internalWorkerId () {
    return Snowflake.toInternalWorkerId(this.value);
  }
  public get internalProcessId () {
    return Snowflake.toInternalProcessId(this.value);
  }
  public get increment () {
    return Snowflake.toIncrement(this.value);
  }
}
