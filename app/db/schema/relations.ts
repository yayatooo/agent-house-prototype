import { relations } from "drizzle-orm";
import { branches } from "./branches";
import { users } from "./users";
import { properties } from "./properties";
import { rentalAgreements, rentalPayments } from "./rentals";
import { purchaseAgreements } from "./purchases";
import { installmentPlans, installmentMilestones } from "./installments";
import { leads } from "./leads";
import { tourSchedules } from "./tours";
import { commissions } from "./commissions";
import { maintenanceRequests } from "./maintenance";
import { activityLogs } from "./activity-logs";

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  properties: many(properties),
  leads: many(leads),
  commissions: many(commissions),
  activities: many(activityLogs),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, { fields: [properties.ownerId], references: [users.id] }),
  rentalAgreements: many(rentalAgreements),
  purchaseAgreements: many(purchaseAgreements),
  installmentPlans: many(installmentPlans),
  tours: many(tourSchedules),
  maintenanceRequests: many(maintenanceRequests),
}));

export const rentalAgreementsRelations = relations(
  rentalAgreements,
  ({ one, many }) => ({
    property: one(properties, {
      fields: [rentalAgreements.propertyId],
      references: [properties.id],
    }),
    payments: many(rentalPayments),
  }),
);

export const rentalPaymentsRelations = relations(rentalPayments, ({ one }) => ({
  agreement: one(rentalAgreements, {
    fields: [rentalPayments.agreementId],
    references: [rentalAgreements.id],
  }),
}));

export const purchaseAgreementsRelations = relations(
  purchaseAgreements,
  ({ one }) => ({
    property: one(properties, {
      fields: [purchaseAgreements.propertyId],
      references: [properties.id],
    }),
    installmentPlan: one(installmentPlans),
  }),
);

export const installmentPlansRelations = relations(
  installmentPlans,
  ({ one, many }) => ({
    property: one(properties, {
      fields: [installmentPlans.propertyId],
      references: [properties.id],
    }),
    purchaseAgreement: one(purchaseAgreements, {
      fields: [installmentPlans.purchaseAgreementId],
      references: [purchaseAgreements.id],
    }),
    milestones: many(installmentMilestones),
  }),
);

export const installmentMilestonesRelations = relations(
  installmentMilestones,
  ({ one }) => ({
    plan: one(installmentPlans, {
      fields: [installmentMilestones.planId],
      references: [installmentPlans.id],
    }),
  }),
);

export const leadsRelations = relations(leads, ({ one }) => ({
  sales: one(users, { fields: [leads.salesId], references: [users.id] }),
}));

export const tourSchedulesRelations = relations(tourSchedules, ({ one }) => ({
  property: one(properties, {
    fields: [tourSchedules.propertyId],
    references: [properties.id],
  }),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  user: one(users, { fields: [commissions.userId], references: [users.id] }),
}));

export const maintenanceRequestsRelations = relations(
  maintenanceRequests,
  ({ one }) => ({
    property: one(properties, {
      fields: [maintenanceRequests.propertyId],
      references: [properties.id],
    }),
  }),
);

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));
