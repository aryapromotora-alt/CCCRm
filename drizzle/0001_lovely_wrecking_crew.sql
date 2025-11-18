CREATE TABLE `commissionConfigs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bank` varchar(100) NOT NULL,
	`proposalType` enum('novo','refinanciamento','portabilidade','refin_portabilidade','refin_carteira','fgts','clt','outros') NOT NULL,
	`commissionPercentage` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissionConfigs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalNumber` varchar(100) NOT NULL,
	`userId` int NOT NULL,
	`bank` varchar(100) NOT NULL,
	`proposalType` enum('novo','refinanciamento','portabilidade','refin_portabilidade','refin_carteira','fgts','clt','outros') NOT NULL,
	`installments` int NOT NULL,
	`value` int NOT NULL,
	`commission` int NOT NULL,
	`status` enum('ativo','cancelado','concluido') NOT NULL DEFAULT 'ativo',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`),
	CONSTRAINT `proposals_proposalNumber_unique` UNIQUE(`proposalNumber`)
);
