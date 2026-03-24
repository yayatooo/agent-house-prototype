CREATE TYPE "public"."currency" AS ENUM('USD', 'VND');--> statement-breakpoint
CREATE TYPE "public"."installment_plan_type" AS ENUM('STANDARD_PURCHASE', 'LEASE_PURCHASE', 'BANK_FINANCED');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'ACTIVE', 'RESERVED', 'RENTED', 'SOLD', 'ARCHIVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PAID', 'OVERDUE', 'DEFERRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('APARTMENT', 'HOUSE', 'TOWNHOUSE', 'SHOPHOUSE', 'LAND', 'COMMERCIAL', 'OFFICETEL');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('RENT', 'SELL', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMINISTRATOR', 'OFFICE_ADMIN', 'PROPERTY_OWNER', 'SALES');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity" varchar(100) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_vi" varchar(255) NOT NULL,
	"address" varchar(500) NOT NULL,
	"address_vi" varchar(500) NOT NULL,
	"city" varchar(100) NOT NULL,
	"phone" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_id" varchar(255) NOT NULL,
	"amount_usd" numeric(12, 2) NOT NULL,
	"amount_vnd" bigint NOT NULL,
	"percentage" double precision NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"paid_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_currency" varchar(3) NOT NULL,
	"to_currency" varchar(3) NOT NULL,
	"rate" numeric(15, 4) NOT NULL,
	"effective_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"full_name_vi" varchar(255),
	"phone" varchar(20),
	"avatar" varchar(512),
	"branch_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"title_vi" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"description_vi" text NOT NULL,
	"property_type" "property_type" NOT NULL,
	"transaction_type" "transaction_type" NOT NULL,
	"price_usd" numeric(15, 2) NOT NULL,
	"price_vnd" bigint NOT NULL,
	"rent_price_usd" numeric(12, 2),
	"rent_price_vnd" bigint,
	"area" double precision NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" integer NOT NULL,
	"floor" integer,
	"direction" varchar(20),
	"legal_status" varchar(255) NOT NULL,
	"legal_status_vi" varchar(255) NOT NULL,
	"address" varchar(500) NOT NULL,
	"address_vi" varchar(500) NOT NULL,
	"province" varchar(100) NOT NULL,
	"district" varchar(100) NOT NULL,
	"ward" varchar(100) NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"images" text[] NOT NULL,
	"video_url" varchar(512),
	"amenities" jsonb,
	"furnished" varchar(50),
	"year_built" integer,
	"installment_avail" boolean DEFAULT false NOT NULL,
	"status" "listing_status" DEFAULT 'DRAFT' NOT NULL,
	"owner_id" uuid NOT NULL,
	"approved_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rental_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"tenant_name" varchar(255) NOT NULL,
	"tenant_email" varchar(255) NOT NULL,
	"tenant_phone" varchar(20) NOT NULL,
	"tenant_id_number" varchar(50) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"monthly_rent_usd" numeric(12, 2) NOT NULL,
	"monthly_rent_vnd" bigint NOT NULL,
	"deposit_usd" numeric(12, 2) NOT NULL,
	"deposit_vnd" bigint NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"contract_url" varchar(512),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rental_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agreement_id" uuid NOT NULL,
	"due_date" timestamp NOT NULL,
	"amount_usd" numeric(12, 2) NOT NULL,
	"amount_vnd" bigint NOT NULL,
	"paid_date" timestamp,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"transaction_ref" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"buyer_name" varchar(255) NOT NULL,
	"buyer_email" varchar(255) NOT NULL,
	"buyer_phone" varchar(20) NOT NULL,
	"buyer_id_number" varchar(50) NOT NULL,
	"total_price_usd" numeric(15, 2) NOT NULL,
	"total_price_vnd" bigint NOT NULL,
	"payment_method" varchar(30) NOT NULL,
	"bank_guarantee" boolean DEFAULT true NOT NULL,
	"contract_url" varchar(512),
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installment_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"milestone_order" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"title_vi" varchar(255) NOT NULL,
	"percentage" double precision NOT NULL,
	"amount_vnd" bigint NOT NULL,
	"amount_usd" numeric(15, 2) NOT NULL,
	"due_date" timestamp,
	"paid_date" timestamp,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"transaction_ref" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"purchase_agreement_id" uuid,
	"plan_type" "installment_plan_type" NOT NULL,
	"total_amount_vnd" bigint NOT NULL,
	"total_amount_usd" numeric(15, 2) NOT NULL,
	"deposit_percent" double precision DEFAULT 5 NOT NULL,
	"first_install_percent" double precision DEFAULT 30 NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "installment_plans_purchase_agreement_id_unique" UNIQUE("purchase_agreement_id")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sales_id" uuid NOT NULL,
	"client_name" varchar(255) NOT NULL,
	"client_email" varchar(255),
	"client_phone" varchar(20) NOT NULL,
	"interest" varchar(10) NOT NULL,
	"budget" varchar(100),
	"notes" text,
	"status" varchar(20) DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"client_name" varchar(255) NOT NULL,
	"client_phone" varchar(20) NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"sales_id" uuid,
	"status" varchar(20) DEFAULT 'SCHEDULED' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"title_vi" varchar(255),
	"description" text NOT NULL,
	"priority" varchar(20) DEFAULT 'MEDIUM' NOT NULL,
	"status" varchar(20) DEFAULT 'OPEN' NOT NULL,
	"images" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental_agreements" ADD CONSTRAINT "rental_agreements_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental_payments" ADD CONSTRAINT "rental_payments_agreement_id_rental_agreements_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."rental_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_agreements" ADD CONSTRAINT "purchase_agreements_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_milestones" ADD CONSTRAINT "installment_milestones_plan_id_installment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."installment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_plans" ADD CONSTRAINT "installment_plans_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_plans" ADD CONSTRAINT "installment_plans_purchase_agreement_id_purchase_agreements_id_fk" FOREIGN KEY ("purchase_agreement_id") REFERENCES "public"."purchase_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_sales_id_users_id_fk" FOREIGN KEY ("sales_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_schedules" ADD CONSTRAINT "tour_schedules_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;