import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { donations, users } from "@/lib/db/schema";

export async function getRecentDonations(
  fundraiserId: string,
  limit = 10,
) {
  return db
    .select({
      donation: donations,
      donor: users,
    })
    .from(donations)
    .leftJoin(users, eq(donations.donorId, users.id))
    .where(eq(donations.fundraiserId, fundraiserId))
    .orderBy(desc(donations.createdAt))
    .limit(limit);
}

export async function getTopDonations(
  fundraiserId: string,
  limit = 10,
) {
  return db
    .select({
      donation: donations,
      donor: users,
    })
    .from(donations)
    .leftJoin(users, eq(donations.donorId, users.id))
    .where(eq(donations.fundraiserId, fundraiserId))
    .orderBy(desc(donations.amountCents))
    .limit(limit);
}

export type DonationWithDonor = Awaited<
  ReturnType<typeof getRecentDonations>
>[number];
