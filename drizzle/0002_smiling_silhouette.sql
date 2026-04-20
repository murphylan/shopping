CREATE TABLE "home_banner_config" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"title" varchar(128) NOT NULL,
	"subtitle" varchar(256) NOT NULL,
	"gradient_class" varchar(256) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "home_quick_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(64) NOT NULL,
	"icon_key" varchar(32) NOT NULL,
	"search_keyword" varchar(128) NOT NULL,
	"color_class" varchar(256) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
