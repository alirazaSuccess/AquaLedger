-- CreateTable
CREATE TABLE `SubscriptionPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `durationDays` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SubscriptionPlan_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `planId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('TRIAL', 'ACTIVE', 'EXPIRED', 'PENDING', 'CANCELLED') NOT NULL DEFAULT 'TRIAL',
    `paidAt` DATETIME(3) NULL,
    `activatedAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Subscription_storeId_idx`(`storeId`),
    INDEX `Subscription_planId_idx`(`planId`),
    INDEX `Subscription_status_idx`(`status`),
    INDEX `Subscription_startDate_idx`(`startDate`),
    INDEX `Subscription_endDate_idx`(`endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubscriptionPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subscriptionId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SubscriptionPayment_subscriptionId_idx`(`subscriptionId`),
    INDEX `SubscriptionPayment_status_idx`(`status`),
    INDEX `SubscriptionPayment_paymentDate_idx`(`paymentDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubscriptionPayment` ADD CONSTRAINT `SubscriptionPayment_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
