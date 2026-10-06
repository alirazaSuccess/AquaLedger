/*
  Warnings:

  - Made the column `storeId` on table `customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `storeId` on table `delivery` required. This step will fail if there are existing NULL values in that column.
  - Made the column `storeId` on table `payment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Customer` DROP FOREIGN KEY `Customer_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `Delivery` DROP FOREIGN KEY `Delivery_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_storeId_fkey`;

-- AlterTable
ALTER TABLE `Customer` MODIFY `storeId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Delivery` MODIFY `storeId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Payment` MODIFY `storeId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
