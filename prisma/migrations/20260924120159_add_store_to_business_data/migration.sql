-- AlterTable
ALTER TABLE `customer` ADD COLUMN `storeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `delivery` ADD COLUMN `storeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `storeId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Customer_storeId_idx` ON `Customer`(`storeId`);

-- CreateIndex
CREATE INDEX `Delivery_storeId_idx` ON `Delivery`(`storeId`);

-- CreateIndex
CREATE INDEX `Payment_storeId_idx` ON `Payment`(`storeId`);

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
